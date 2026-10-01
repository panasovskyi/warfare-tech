import {
  ArticleCategory,
  ArticleStatus,
  Subcategory,
} from 'generated/prisma/enums';
import z from 'zod';

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
      .pipe(z.url('Main picture must be a valid URL')),
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
    // TODO: z.url() пропускає будь-яку схему, зокрема javascript: — обмежити до http(s)
    // (опція protocol у z.url), і так само для mainPicture. Посилання прийдуть з ingestion,
    // тобто зі сторонніх сторінок, а фронт ставить sourceLink прямо в href
    sourceLink: z
      .string()
      .trim()
      .pipe(z.url('Source link must be a valid URL'))
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
