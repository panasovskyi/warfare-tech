import { ArticleCategory, Subcategory } from 'generated/prisma/enums';
import z from 'zod';

export const getArticlesSchema = z.object({
  page: z.coerce
    .number('Page must be a number')
    .int('Page must be an integer')
    .positive('Page must be greater than 0')
    .max(999, 'Page cannot be greater than 999')
    .default(1),
  limit: z.coerce
    .number('Limit must be a number')
    .int('Limit must be an integer')
    .positive('Limit must be greater than 0')
    .max(40, 'Limit cannot be greater than 40')
    .default(3),
  category: z.enum(ArticleCategory, 'Invalid category').optional(),
  subcategory: z.enum(Subcategory, 'Invalid subcategory').optional(),
  isWarInUkraine: z
    .stringbool({ error: 'War in Ukraine must be true or false' })
    .optional(),
  isFeatured: z
    .stringbool({ error: 'Featured must be true or false' })
    .optional(),
});

export type GetArticlesQuery = z.infer<typeof getArticlesSchema>;
