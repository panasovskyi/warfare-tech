import { z } from 'zod';

// What the model returns. Deliberately lenient: the SDK sends only the basic shape
// to the API (no enum values, no length limits), so a strict schema here would just
// throw away a whole paid reply over one wrong word. The real rules live in
// article.schema.ts and run on our side, where a bad value becomes a problem in the
// draft instead of a lost reply.
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
