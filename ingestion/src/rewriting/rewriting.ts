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

// Що потрібно для рерайту: текст джерела, назва видання й дата публікації
export type RewriteInput = {
  sourceText: string;
  sourceName: string;
  // YYYY-MM-DD: щоб модель могла перетворити «last month» на «September 2026»
  publishedAt?: string;
};

export type RewriteResult = {
  // Англійська стаття, готова для сайту
  article: ModelArticle;
  // Лише для українського джерела: український рерайт, з якого перекладено англійський текст.
  // Збіги з джерелом міряються саме на ньому, мовою джерела.
  intermediate?: { title: string; description: string; body: string };
  model: string;
  usage: GenerateResult['usage'];
  overlap: OverlapReport;
  warnings: string[];
};

// Помилка рерайту: порожній текст або неправильна дата
export class RewritingError extends Error {}

// Модель вирішила, що в тексті нема статті (заглушка paywall, порожня сторінка)
export class UnusableSourceError extends RewritingError {}

// Відкриваючий або закриваючий тег, яким у промпті обгорнуто джерело
const SOURCE_TAG_PATTERN = new RegExp(`</?${SOURCE_TAG}\\s*>`, 'gi');
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Перетворює YYYY-MM-DD на дату з днем тижня для промпта («Friday, October 2, 2026»); неправильна дата — помилка
const formatPublicationDate = (publishedAt: string): string => {
  const date = new Date(`${publishedAt}T00:00:00Z`);

  // Перевірка «туди й назад» ловить дати, які парсер мовчки зсуває, на кшталт 2026-02-30
  if (
    !ISO_DATE.test(publishedAt) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== publishedAt
  ) {
    throw new RewritingError(
      `Invalid publication date "${publishedAt}": use YYYY-MM-DD`,
    );
  }

  // День тижня рахуємо тут, а не модель: моделі в цьому ненадійні
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

// Повідомлення для моделі: видання, дата публікації й текст джерела в тегах
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

// Тексту сторінки не довіряємо: якби в ньому був закриваючий тег, решту тексту
// прочитали б як інструкції, а не як матеріал
const cleanSourceText = (sourceText: string): string => {
  const text = sourceText.replace(SOURCE_TAG_PATTERN, '').trim();

  if (!text) {
    throw new RewritingError('Source text is empty');
  }

  return text;
};

// Складає токени двох викликів: рерайту й перекладу
const sumUsage = (
  first: GenerateResult['usage'],
  second: GenerateResult['usage'],
): GenerateResult['usage'] => ({
  inputTokens: first.inputTokens + second.inputTokens,
  outputTokens: first.outputTokens + second.outputTokens,
});

// Рерайт: визначає мову джерела, просить модель переписати, міряє збіги з джерелом і збирає попередження.
// Для українського джерела додає другий виклик — переклад англійською.
export const rewrite = async ({
  sourceText,
  sourceName,
  publishedAt,
}: RewriteInput): Promise<RewriteResult> => {
  const text = cleanSourceText(sourceText);
  // Українське джерело переписуємо українською, а англійською його перекладає окремий виклик
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

  // Міряємо мовою джерела: саме з ним порівнюється рерайт
  const overlap = measureOverlap(rewritten.body, text);
  const descriptionRepeats =
    measureOverlap(rewritten.description, text).ranges.length > 0;

  // Англійське джерело: рерайт уже англійською, лишається зібрати попередження
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

  // Українське джерело: другий платний виклик перекладає рерайт англійською
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
