import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { ZodType } from 'zod';
import { config } from '../config/config';

export type GenerateParams = {
  system: string;
  prompt: string;
  maxTokens?: number;
};

export type GenerateResult = {
  text: string;
  model: string;
  stopReason: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
};

export type GenerateJsonResult<T> = {
  data: T;
  model: string;
  stopReason: string | null;
  usage: GenerateResult['usage'];
};

export class LlmError extends Error {}

const DEFAULT_MAX_TOKENS = 16000;

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

const toLlmError = (error: unknown): LlmError => {
  if (error instanceof Anthropic.AuthenticationError) {
    return new LlmError('Anthropic rejected the API key', { cause: error });
  }

  if (error instanceof Anthropic.RateLimitError) {
    return new LlmError('Rate limited by Anthropic, retry later', {
      cause: error,
    });
  }

  if (error instanceof Anthropic.BadRequestError) {
    return new LlmError(`Bad request: ${error.message}`, { cause: error });
  }

  if (error instanceof Anthropic.APIError) {
    return new LlmError(`Anthropic API error ${error.status}: ${error.message}`, {
      cause: error,
    });
  }

  // The SDK throws this when it cannot read a structured reply, usually because
  // the JSON was cut off by max_tokens
  if (error instanceof Anthropic.AnthropicError) {
    return new LlmError(
      `Could not read the structured reply (it may have been cut off by max_tokens): ${error.message}`,
      { cause: error },
    );
  }

  return new LlmError('Unexpected error while calling the model', {
    cause: error,
  });
};

const assertNotRefused = (response: Anthropic.Beta.BetaMessage): void => {
  if (response.stop_reason === 'refusal') {
    const category = response.stop_details?.category ?? 'unknown category';

    throw new LlmError(`The model refused the request (${category})`);
  }
};

const toUsage = (
  response: Anthropic.Beta.BetaMessage,
): GenerateResult['usage'] => ({
  inputTokens: response.usage.input_tokens,
  outputTokens: response.usage.output_tokens,
});

export const generate = async ({
  system,
  prompt,
  maxTokens = DEFAULT_MAX_TOKENS,
}: GenerateParams): Promise<GenerateResult> => {
  try {
    const response = await anthropic.beta.messages.create({
      model: config.model,
      max_tokens: maxTokens,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      messages: [{ role: 'user', content: prompt }],
    });

    assertNotRefused(response);

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    return {
      text,
      model: response.model,
      stopReason: response.stop_reason,
      usage: toUsage(response),
    };
  } catch (error) {
    throw error instanceof LlmError ? error : toLlmError(error);
  }
};

// The reply is constrained to the schema by the API, then checked against it by
// zod. The API ignores length limits in a schema, so keep the schema lenient and
// validate length rules separately.
export const generateJson = async <T>({
  system,
  prompt,
  maxTokens = DEFAULT_MAX_TOKENS,
  schema,
}: GenerateParams & { schema: ZodType<T> }): Promise<GenerateJsonResult<T>> => {
  try {
    const response = await anthropic.beta.messages.parse({
      model: config.model,
      max_tokens: maxTokens,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      messages: [{ role: 'user', content: prompt }],
      output_config: { format: zodOutputFormat(schema) },
    });

    assertNotRefused(response);

    if (!response.parsed_output) {
      throw new LlmError('The model returned no structured output');
    }

    return {
      data: response.parsed_output,
      model: response.model,
      stopReason: response.stop_reason,
      usage: toUsage(response),
    };
  } catch (error) {
    throw error instanceof LlmError ? error : toLlmError(error);
  }
};
