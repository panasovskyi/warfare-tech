import { z } from 'zod';

export const modelArticleSchema = z.object({
  usable: z.boolean(),
  reason: z.string(),
  title: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  isWarInUkraine: z.boolean(),
  subcategory: z.string().nullable(),
});

export type ModelArticle = z.infer<typeof modelArticleSchema>;
