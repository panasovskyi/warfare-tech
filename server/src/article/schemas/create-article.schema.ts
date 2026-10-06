import {
  ArticleCategory,
  ArticleStatus,
  Subcategory,
} from 'generated/prisma/enums';
import z from 'zod';

// Хости, з яких фронт показує фото: next/image кидає помилку на невідомому хості, і вся
// сторінка списку віддає 500. Тримати в синхроні з images.remotePatterns у
// client/next.config.ts (там і https як протокол) та з ingestion/src/article/article.schema.ts.
// placehold.co — тестові дані й заглушка, res.cloudinary.com — фото, які завантажує ingestion
const IMAGE_HOSTNAME = /^(placehold\.co|res\.cloudinary\.com)$/;

// body — Markdown, але лише те, що вміє фронт: абзаци, посилання http(s) і картинки окремим
// абзацом з описом і підписом, лише з дозволених хостів. Копія цих правил — у
// ingestion/src/article/body-rules.ts: тримати в синхроні
const MAX_BODY_IMAGES = 10;
const IMAGE_IN_BODY = /!\[([^\]]*)\]\(\s*(\S+?)(?:\s+"([^"]*)")?\s*\)/g;
const LINK_IN_BODY = /(?<!!)\[[^\]]*\]\(\s*(\S+?)(?:\s+"[^"]*")?\s*\)/g;
const HTML_IN_BODY = /<\/?[a-z][^>]*>/i;

const isAllowedImage = (address: string): boolean => {
  try {
    const url = new URL(address);

    return url.protocol === 'https:' && IMAGE_HOSTNAME.test(url.hostname);
  } catch {
    return false;
  }
};

const shorten = (text: string): string =>
  text.length > 60 ? `${text.slice(0, 60)}…` : text;

const checkBodyMarkdown = (body: string): string[] => {
  const problems: string[] = [];

  if (HTML_IN_BODY.test(body)) {
    problems.push('HTML is not allowed in the body: it is Markdown');
  }

  const images = [...body.matchAll(IMAGE_IN_BODY)];

  if (images.length > MAX_BODY_IMAGES) {
    problems.push(`Too many images in the body: ${MAX_BODY_IMAGES} at most`);
  }

  for (const [, alt, address, caption] of images) {
    if (!alt?.trim()) {
      problems.push(
        'Every image in the body needs a description (the text in the square brackets)',
      );
    }

    if (!caption?.trim()) {
      problems.push(
        'Every image in the body needs a caption: ![description](address "caption")',
      );
    }

    if (!address || !isAllowedImage(address)) {
      problems.push(
        `The image "${shorten(address ?? '')}" must be an https address on an allowed image host`,
      );
    }
  }

  // Картинки стоять між абзацами: фронт малює їх як figure на всю ширину колонки
  for (const paragraph of body.split(/\n\s*\n/)) {
    const found = [...paragraph.matchAll(IMAGE_IN_BODY)];

    if (
      found.length > 0 &&
      !(found.length === 1 && paragraph.trim() === found[0]?.[0])
    ) {
      problems.push(
        'An image in the body must be a paragraph of its own: put a blank line before and after it',
      );
    }
  }

  // Фронт ставить посилання в href: javascript: і подібне не можна
  for (const [, address] of body.matchAll(LINK_IN_BODY)) {
    if (!address || !/^https?:\/\//i.test(address)) {
      problems.push(
        `Links in the body must start with http:// or https:// (found "${shorten(address ?? '')}")`,
      );
    }
  }

  return [...new Set(problems)];
};

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
    // Автор або джерело головного фото ("Airbus", "Staff Sgt. … / U.S. Air Force"): фронт малює
    // "Photo: <photoCredit>" на самому фото, тож префікс "Photo:" тут не пишеться
    photoCredit: z
      .string()
      .trim()
      .min(1, 'Photo credit cannot be empty')
      .max(200, 'Photo credit too long: maximum 200 characters')
      .optional(),
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
    // TODO: для майбутнього PATCH цю перевірку запускати над статтею, злитою зі збереженою:
    // правило живе лише тут, база його не гарантує
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
  })

  .superRefine((data, ctx) => {
    for (const message of checkBodyMarkdown(data.body)) {
      ctx.addIssue({ code: 'custom', path: ['body'], message });
    }
  });

export type CreateArticlePayload = z.infer<typeof createArticleSchema>;
