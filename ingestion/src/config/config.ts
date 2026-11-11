import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ quiet: true });

const envSchema = z.object({
  ANTHROPIC_API_KEY: z
    .string('ANTHROPIC_API_KEY is required')
    .trim()
    .min(1, 'ANTHROPIC_API_KEY is required'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment:\n${z.prettifyError(parsed.error)}`);
}

export const config = {
  anthropicApiKey: parsed.data.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-5-5',
} as const;
