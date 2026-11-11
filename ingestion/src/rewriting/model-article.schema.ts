import { z } from 'zod';

// Те, що повертає модель. Схема навмисно м'яка: SDK передає в API лише базову форму
// (без значень enum і без обмежень довжини), тож сувора схема просто викинула б
// усю оплачену відповідь через одне хибне слово. Справжні правила живуть у
// article.schema.ts і виконуються в нас: хибне значення стає проблемою в чернетці,
// а не втраченою відповіддю.
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
