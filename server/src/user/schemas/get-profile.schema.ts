import z from 'zod';

export const getProfileSchema = z.object({
  login: z
    .string()
    .min(3, 'Login too short: minimum 3 characters')
    .max(20, 'Login too long: maximum 20 characters'),
});

export type GetProfileParam = z.infer<typeof getProfileSchema>;
