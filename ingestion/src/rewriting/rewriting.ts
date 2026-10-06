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
  // YYYY-MM-DD: lets the model turn "last month" into "September 2026"
  publishedAt?: string;
};

export type RewriteResult = {
  // The English article, ready for the site
  article: ModelArticle;
  // Only for a Ukrainian source: the Ukrainian rewrite the English text was translated from.
  // The overlap with the source is measured on it, in the language of the source.
  intermediate?: { title: string; description: string; body: string };
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

  // Measured in the language of the source, which is what the rewrite is compared with
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
