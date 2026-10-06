import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ quiet: true });

const envSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z
    .string('CLOUDINARY_CLOUD_NAME is required')
    .trim()
    .min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z
    .string('CLOUDINARY_API_KEY is required')
    .trim()
    .min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z
    .string('CLOUDINARY_API_SECRET is required')
    .trim()
    .min(1, 'CLOUDINARY_API_SECRET is required'),
});

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

// Read on demand, not at import: only the runs that upload a picture need it
export const getCloudinaryConfig = (): CloudinaryConfig => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    parsed.data;

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    apiSecret: CLOUDINARY_API_SECRET,
  };
};
