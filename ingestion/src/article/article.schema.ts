import { z } from 'zod';
import {
  checkBodyMarkdown,
  findImagePlaceholders,
  IMAGE_HOSTNAME,
} from './body-rules';

// Mirror of server/src/article/schemas/create-article.schema.ts: keep the two in
// sync, because the server is the one that finally accepts or rejects an article.
// TODO: автотест, що це дзеркало дає ті самі результати, що серверна схема (зараз це
// перевіряв одноразовий скрипт)

export const ArticleCategory = {
  NEWS: 'NEWS',
  LONGREAD: 'LONGREAD',
} as const;

export const ArticleSubcategory = {
  AIR: 'AIR',
  LAND: 'LAND',
  CYBER: 'CYBER',
  SPACE: 'SPACE',
  NAVAL: 'NAVAL',
  UAV: 'UAV',
} as const;

export const ArticleStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export const articleSchema = z
  .object({
    category: z.enum(ArticleCategory, 'Invalid category'),
    subcategory: z.enum(ArticleSubcategory, 'Invalid subcategory').optional(),
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
  })

  .superRefine((data, ctx) => {
    for (const message of checkBodyMarkdown(data.body)) {
      ctx.addIssue({ code: 'custom', path: ['body'], message });
    }
  });

// What a draft file holds. A draft has no status (publishing sets it), and a missing
// subcategory is written as null, which the server schema would reject.
export type ArticleDraft = {
  category: (typeof ArticleCategory)[keyof typeof ArticleCategory];
  subcategory: (typeof ArticleSubcategory)[keyof typeof ArticleSubcategory] | null;
  isFeatured: boolean;
  isWarInUkraine: boolean;
  mainPicture: string;
  // Empty when the picture needs no credit (our own placeholder)
  photoCredit?: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  source: string;
  sourceLink: string;
};

// Returns the problems the server would report; an empty list means it would accept
export const validateArticle = (article: ArticleDraft): string[] => {
  const result = articleSchema.safeParse({
    ...article,
    subcategory: article.subcategory ?? undefined,
  });

  // Not a server rule: words that `upload-image` leaves for the owner to replace
  const placeholders = findImagePlaceholders(article.body).map(
    (message) => `body: ${message}`,
  );

  if (result.success) {
    return placeholders;
  }

  return [
    ...result.error.issues.map(
      (issue) => `${issue.path.join('.') || 'article'}: ${issue.message}`,
    ),
    ...placeholders,
  ];
};
