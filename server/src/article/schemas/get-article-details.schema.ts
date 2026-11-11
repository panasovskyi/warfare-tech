import z from 'zod';

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
