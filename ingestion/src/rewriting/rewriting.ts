import { generateJson, type GenerateResult } from '../llm/llm.client';
import { isMostlyCyrillic } from '../translation/cyrillic';
import { translateArticle } from '../translation/translate';
import { checkDraft } from './checks';
import {
  modelArticleSchema,
  type ModelArticle,
} from './model-article.schema';
import { measureOverlap, type OverlapReport } from './overlap';
import { getRewritePrompt, SOURCE_TAG, type OutputLanguage } from './rules';

export type RewriteInput = {
  sourceText: string;
  sourceName: string;
  publishedAt?: string;
};

export type RewriteResult = {
  article: ModelArticle;
  intermediate?: { title: string; description: string; body: string };
  model: string;
  usage: GenerateResult['usage'];
  overlap: OverlapReport;
  warnings: string[];
};

export class RewritingError extends Error {}

export class UnusableSourceError extends RewritingError {}

const SOURCE_TAG_PATTERN = new RegExp(`</?${SOURCE_TAG}\\s*>`, 'gi');
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const formatPublicationDate = (publishedAt: string): string => {
  const date = new Date(`${publishedAt}T00:00:00Z`);

  if (
    !ISO_DATE.test(publishedAt) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== publishedAt
  ) {
    throw new RewritingError(
      `Invalid publication date "${publishedAt}": use YYYY-MM-DD`,
    );
  }

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

const cleanSourceText = (sourceText: string): string => {
  const text = sourceText.replace(SOURCE_TAG_PATTERN, '').trim();

  if (!text) {
    throw new RewritingError('Source text is empty');
  }

  return text;
};

const sumUsage = (
  first: GenerateResult['usage'],
  second: GenerateResult['usage'],
): GenerateResult['usage'] => ({
  inputTokens: first.inputTokens + second.inputTokens,
  outputTokens: first.outputTokens + second.outputTokens,
});

export const rewrite = async ({
  sourceText,
  sourceName,
  publishedAt,
}: RewriteInput): Promise<RewriteResult> => {
  const text = cleanSourceText(sourceText);
  const language: OutputLanguage = isMostlyCyrillic(text) ? 'uk' : 'en';

  const result = await generateJson({
    system: getRewritePrompt(language),
    prompt: buildPrompt(text, sourceName, publishedAt),
    schema: modelArticleSchema,
  });

  const rewritten = result.data;

  if (!rewritten.usable) {
    throw new UnusableSourceError(
      `The source is not a usable article: ${rewritten.reason || 'no reason given'}`,
    );
  }

  const overlap = measureOverlap(rewritten.body, text);
  const descriptionRepeats =
    measureOverlap(rewritten.description, text).ranges.length > 0;

  if (language === 'en') {
    return {
      article: rewritten,
      model: result.model,
      usage: result.usage,
      overlap,
      warnings: [
        ...(overlap.warning ? [overlap.warning] : []),
        ...(descriptionRepeats
          ? ['The description repeats wording from the source: rephrase it']
          : []),
        ...checkDraft({
          title: rewritten.title,
          description: rewritten.description,
          body: rewritten.body,
          sourceName,
          sourceText: text,
        }),
      ],
    };
  }

  const translated = await translateArticle(rewritten);
  const article: ModelArticle = {
    ...rewritten,
    title: translated.title,
    description: translated.description,
    body: translated.body,
  };

  return {
    article,
    intermediate: {
      title: rewritten.title,
      description: rewritten.description,
      body: rewritten.body,
    },
    model: translated.model,
    usage: sumUsage(result.usage, translated.usage),
    overlap,
    warnings: [
      ...(overlap.warning
        ? [`The Ukrainian rewrite (see the .uk.md file): ${overlap.warning}`]
        : []),
      ...(descriptionRepeats
        ? ['The Ukrainian description repeats wording from the source']
        : []),
      ...translated.warnings.map((warning) => `Translation: ${warning}`),
      ...checkDraft({
        title: article.title,
        description: article.description,
        body: article.body,
        sourceName,
        sourceText: text,
      }),
    ],
  };
};
