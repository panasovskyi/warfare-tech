import z from 'zod';

// TODO: прибрати min/max, коли правила логіна в реєстрації зміняться.
// Схема пошуку не має бути суворішою за дані, що вже лежать у базі:
// логін, створений за старими правилами (напр. 2 символи), інакше отримає 400 замість профілю.
export const getProfileSchema = z.object({
  login: z
    .string()
    .min(3, 'Login too short: minimum 3 characters')
    .max(20, 'Login too long: maximum 20 characters'),
});

export type GetProfileParam = z.infer<typeof getProfileSchema>;
