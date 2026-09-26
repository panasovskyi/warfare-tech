import z from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Required field'),
  password: z.string().min(1, 'Required field'),
});

export type LoginPayload = z.infer<typeof loginSchema>;
