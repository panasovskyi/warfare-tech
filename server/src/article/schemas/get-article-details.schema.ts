import z from 'zod';

// TODO: якщо зміниться формат генерації slug (slugify / суфікс), послабити регулярку й max.
// Схема пошуку не має бути суворішою за дані, що вже лежать у базі:
// статті зі slug старого формату інакше отримають 400 замість сторінки.
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const getArticleDetailsSchema = z.object({
  slug: z
    .string()
    .max(250, 'Slug too long: maximum 250 characters')
    .regex(
      SLUG_REGEX,
      'Slug must contain only lowercase letters, digits and hyphens',
    ),
});

export type GetArticleDetailsParam = z.infer<typeof getArticleDetailsSchema>;
