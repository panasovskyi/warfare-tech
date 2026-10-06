import { splitDraft } from '../drafts/draft-file.schema';
import { hasCyrillic } from './cyrillic';
import type { TranslationItem } from './translate';

export type DraftParts = {
  title: string;
  description: string;
  tags: string[];
  body: string;
};

const splitParagraphs = (body: string): string[] =>
  body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

// Only what contains Ukrainian is sent to the model: the rest of the draft is never touched
export const collectCyrillicItems = ({
  title,
  description,
  tags,
  body,
}: DraftParts): TranslationItem[] => {
  const items: TranslationItem[] = [];

  if (hasCyrillic(title)) {
    items.push({ id: 'title', text: title });
  }

  if (hasCyrillic(description)) {
    items.push({ id: 'description', text: description });
  }

  tags.forEach((tag, index) => {
    if (hasCyrillic(tag)) {
      items.push({ id: `tag:${index}`, text: tag });
    }
  });

  splitParagraphs(body).forEach((paragraph, index) => {
    if (hasCyrillic(paragraph)) {
      items.push({ id: `p${index}`, text: paragraph });
    }
  });

  return items;
};

// Only single-line values are rewritten: a title that the owner turned into a
// multi-line YAML block is reported instead of being broken
const SINGLE_LINE = {
  title: /^title:[ \t]+(?![>|])\S.*$/m,
  description: /^description:[ \t]+(?![>|])\S.*$/m,
  tags: /^tags:[ \t]*\[.*\][ \t]*$/m,
};

const replaceFrontLine = (
  front: string,
  key: keyof typeof SINGLE_LINE,
  value: string,
  warnings: string[],
): string => {
  if (!SINGLE_LINE[key].test(front)) {
    warnings.push(`"${key}" is not a single-line value: translate it by hand`);

    return front;
  }

  // A function, so that "$&" or "$'" in a title is not read as a replacement pattern
  return front.replace(SINGLE_LINE[key], () => `${key}: ${value}`);
};

// Puts the translations back into the file text and changes nothing else
export const applyTranslations = (
  originalText: string,
  parts: DraftParts,
  translated: Map<string, string>,
): { text: string; warnings: string[] } => {
  const warnings: string[] = [];
  const usesCrlf = originalText.includes('\r\n');
  const { front, body } = splitDraft(originalText.replace(/\r\n/g, '\n'));
  let newFront = front;

  const title = translated.get('title');

  if (title !== undefined) {
    newFront = replaceFrontLine(newFront, 'title', JSON.stringify(title), warnings);
  }

  const description = translated.get('description');

  if (description !== undefined) {
    newFront = replaceFrontLine(
      newFront,
      'description',
      JSON.stringify(description),
      warnings,
    );
  }

  if (parts.tags.some((_, index) => translated.has(`tag:${index}`))) {
    const tags = parts.tags.map((tag, index) => translated.get(`tag:${index}`) ?? tag);

    newFront = replaceFrontLine(newFront, 'tags', JSON.stringify(tags), warnings);
  }

  const newBody = splitParagraphs(body)
    .map((paragraph, index) => translated.get(`p${index}`) ?? paragraph)
    .join('\n\n');

  const text = `---\n${newFront}\n---\n\n${newBody}\n`;

  return { text: usesCrlf ? text.replace(/\n/g, '\r\n') : text, warnings };
};

// The title, the description and the whole text at once, for a draft that is translated
// from its Ukrainian version: the number of paragraphs may differ from the old English
// text, so the body is swapped as a whole. Tags, picture, credit and notes stay as they were.
export const replaceArticleText = (
  originalText: string,
  article: { title: string; description: string; body: string },
): { text: string; warnings: string[] } => {
  const warnings: string[] = [];
  const usesCrlf = originalText.includes('\r\n');
  const { front } = splitDraft(originalText.replace(/\r\n/g, '\n'));

  let newFront = replaceFrontLine(
    front,
    'title',
    JSON.stringify(article.title),
    warnings,
  );

  newFront = replaceFrontLine(
    newFront,
    'description',
    JSON.stringify(article.description),
    warnings,
  );

  const text = `---\n${newFront}\n---\n\n${article.body.trim()}\n`;

  return { text: usesCrlf ? text.replace(/\n/g, '\r\n') : text, warnings };
};
