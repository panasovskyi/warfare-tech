import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ quiet: true });

const envSchema = z.object({
  API_BASE_URL: z
    .string('API_BASE_URL is required')
    .trim()
    .pipe(
      z.url({
        error:
          'API_BASE_URL must be a URL, for example http://localhost:5000/api',
      }),
    ),
  ADMIN_LOGIN: z
    .string('ADMIN_LOGIN is required')
    .trim()
    .min(1, 'ADMIN_LOGIN is required'),
  ADMIN_PASSWORD: z
    .string('ADMIN_PASSWORD is required')
    .min(1, 'ADMIN_PASSWORD is required'),
});

export type PublishingConfig = {
  apiBaseUrl: string;
  login: string;
  password: string;
};

export const getPublishingConfig = (): PublishingConfig => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }

  const { API_BASE_URL, ADMIN_LOGIN, ADMIN_PASSWORD } = parsed.data;

  return {
    apiBaseUrl: API_BASE_URL.replace(/\/+$/, ''),
    login: ADMIN_LOGIN,
    password: ADMIN_PASSWORD,
  };
};
