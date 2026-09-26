import z from 'zod';

export const registrationSchema = z
  .object({
    login: z
      .string()
      .trim()
      .min(3, 'Login too short: minimum 3 characters')
      .max(20, 'Login too long: maximum 20 characters'),
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name too short: minimum 2 characters')
      .max(60, 'Full name too long: maximum 60 characters'),
    email: z.email('Invalid email').trim().toLowerCase(),
    password: z
      .string()
      .min(8, 'Password too short: minimum 8 characters')
      .max(72, 'Password too long: maximum 72 characters'),
    passwordConfirmation: z.string().min(1).max(72),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  })
  .transform((data) => {
    return {
      login: data.login,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    };
  });

export type RegistrationPayload = z.infer<typeof registrationSchema>;
