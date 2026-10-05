import {
  ArticleCategory,
  ArticleStatus,
  Subcategory,
} from 'generated/prisma/enums';
import z from 'zod';

// Хости, з яких фронт показує фото: next/image кидає помилку на невідомому хості, і вся
// сторінка списку віддає 500. Тримати в синхроні з images.remotePatterns у
// client/next.config.ts (там і https як протокол).
// TODO: коли ingestion завантажуватиме фото у своє сховище (Cloudinary) — замінити на його хост
const IMAGE_HOSTNAME = /^placehold\.co$/;

export const createArticleSchema = z
  .object({
    category: z.enum(ArticleCategory, 'Invalid category'),
    subcategory: z.enum(Subcategory, 'Invalid subcategory').optional(),
    status: z.enum(ArticleStatus, 'Invalid status').optional(),
    isFeatured: z.boolean('Featured must be a boolean').optional(),
    isWarInUkraine: z.boolean('War in Ukraine must be a boolean').optional(),
    mainPicture: z
      .string()
      .trim()
      .pipe(
        z.url({
          protocol: /^https$/,
          hostname: IMAGE_HOSTNAME,
          error: 'Main picture must be an https URL on an allowed image host',
        }),
      ),
    title: z
      .string()
      .trim()
      .min(5, 'Title too short: minimum 5 characters')
      .max(200, 'Title too long: maximum 200 characters'),
    description: z
      .string()
      .trim()
      .min(50, 'Description too short: minimum 50 characters')
      .max(500, 'Description too long: maximum 500 characters'),
    body: z
      .string()
      .trim()
      .min(1000, 'Body too short: minimum 1000 characters'),
    tags: z
      .array(z.string().trim().min(1, 'Tag cannot be empty'))
      .max(10, 'Too many tags')
      .optional(),
    source: z.string().trim().min(1, 'Source cannot be empty').optional(),
    // Лише http(s): z.url() без protocol пропускає будь-яку схему, зокрема javascript:, а
    // фронт ставить sourceLink прямо в href. Посилання прийдуть з ingestion, зі сторонніх сторінок
    sourceLink: z
      .string()
      .trim()
      .pipe(
        z.url({
          protocol: /^https?$/,
          error: 'Source link must be a valid http(s) URL',
        }),
      )
      .optional(),
  })

  .superRefine((data, ctx) => {
    if (data.category === ArticleCategory.NEWS) {
      if (data.isWarInUkraine && data.subcategory) {
        ctx.addIssue({
          code: 'custom',
          path: ['subcategory'],
          message: 'Subcategory is not allowed for War in Ukraine news',
        });
      }

      if (!data.isWarInUkraine && !data.subcategory) {
        ctx.addIssue({
          code: 'custom',
          path: ['subcategory'],
          message:
            'Subcategory is required for News category if it is not related to war in Ukraine',
        });
      }
    }

    if (data.category === ArticleCategory.LONGREAD) {
      if (data.subcategory) {
        ctx.addIssue({
          code: 'custom',
          path: ['subcategory'],
          message: 'Subcategory is not allowed for Longread category',
        });
      }

      if (data.isWarInUkraine) {
        ctx.addIssue({
          code: 'custom',
          path: ['isWarInUkraine'],
          message: 'War in Ukraine is not allowed for Longread category',
        });
      }
    }
  })

  .superRefine((data, ctx) => {
    if (data.source && !data.sourceLink) {
      ctx.addIssue({
        code: 'custom',
        path: ['sourceLink'],
        message: 'Source link is required when source is provided',
      });
    }

    if (!data.source && data.sourceLink) {
      ctx.addIssue({
        code: 'custom',
        path: ['source'],
        message: 'Source is required when source link is provided',
      });
    }
  });

export type CreateArticlePayload = z.infer<typeof createArticleSchema>;
