import { generateJson, type GenerateResult } from '../llm/llm.client';
import { checkDraft } from './checks';
import {
  modelArticleSchema,
  type ModelArticle,
} from './model-article.schema';
import { measureOverlap, type OverlapReport } from './overlap';
import { REWRITE_SYSTEM_PROMPT, SOURCE_TAG } from './rules';

export type RewriteInput = {
  sourceText: string;
  sourceName: string;
  // YYYY-MM-DD: lets the model turn "last month" into "September 2026"
  publishedAt?: string;
};

export type RewriteResult = {
  article: ModelArticle;
  model: string;
  usage: GenerateResult['usage'];
  overlap: OverlapReport;
  warnings: string[];
};

export class RewritingError extends Error {}

// The model decided there is no article in the text (a paywall stub, an empty page)
export class UnusableSourceError extends RewritingError {}

const SOURCE_TAG_PATTERN = new RegExp(`</?${SOURCE_TAG}\\s*>`, 'gi');
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const formatPublicationDate = (publishedAt: string): string => {
  const date = new Date(`${publishedAt}T00:00:00Z`);

  // The round trip catches dates the parser silently rolls over, like 2026-02-30
  if (
    !ISO_DATE.test(publishedAt) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== publishedAt
  ) {
    throw new RewritingError(
      `Invalid publication date "${publishedAt}": use YYYY-MM-DD`,
    );
  }

  // The weekday is computed here, not by the model: models are unreliable at it
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const buildPrompt = (
  sourceText: string,
  sourceName: string,
  publishedAt?: string,
): string => {
  const header = [`Source outlet: ${sourceName}`];

  if (publishedAt) {
    header.push(`Publication date: ${formatPublicationDate(publishedAt)}`);
  }

  return `${header.join('\n')}\n\n<${SOURCE_TAG}>\n${sourceText}\n</${SOURCE_TAG}>`;
};

// The page text is untrusted: if it contained the closing tag, the rest of it
// would be read as instructions instead of as material
const cleanSourceText = (sourceText: string): string => {
  const text = sourceText.replace(SOURCE_TAG_PATTERN, '').trim();

  if (!text) {
    throw new RewritingError('Source text is empty');
  }

  return text;
};

export const rewrite = async ({
  sourceText,
  sourceName,
  publishedAt,
}: RewriteInput): Promise<RewriteResult> => {
  const text = cleanSourceText(sourceText);

  const result = await generateJson({
    system: REWRITE_SYSTEM_PROMPT,
    prompt: buildPrompt(text, sourceName, publishedAt),
    schema: modelArticleSchema,
  });

  const article = result.data;

  if (!article.usable) {
    throw new UnusableSourceError(
      `The source is not a usable article: ${article.reason || 'no reason given'}`,
    );
  }

  const overlap = measureOverlap(article.body, text);
  const warnings = [
    ...(overlap.warning ? [overlap.warning] : []),
    ...(measureOverlap(article.description, text).ranges.length > 0
      ? ['The description repeats wording from the source: rephrase it']
      : []),
    ...checkDraft({
      title: article.title,
      description: article.description,
      body: article.body,
      sourceName,
      sourceText: text,
    }),
  ];

  return {
    article,
    model: result.model,
    usage: result.usage,
    overlap,
    warnings,
  };
};
