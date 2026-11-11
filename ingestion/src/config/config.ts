import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Підвантажуємо .env одразу при імпорті: ключ Anthropic потрібен усьому, що викликає модель
loadEnv({ quiet: true });

// Обов'язкові змінні середовища: якщо чогось бракує, скрипт одразу каже чого, а не падає десь далі
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

// Ключ береться з .env, а id моделі задано лише тут: щоб змінити модель, міняти треба тільки цей рядок
export const config = {
  anthropicApiKey: parsed.data.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-5-5',
} as const;
