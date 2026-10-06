import { z } from 'zod';
import { toSubcategory } from '../article/article';
import { ArticleCategory, type ArticleDraft } from '../article/article.schema';

const DRAFT_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const CLOSING_DELIMITER = /\r?\n---\r?\n/;
const CYRILLIC = /\p{Script=Cyrillic}/u;

export const splitDraft = (text: string): { front: string; body: string } => {
  const match = DRAFT_PATTERN.exec(text.replace(/^﻿/, ''));

  if (!match) {
    throw new Error('The file has no front matter: it must start with a --- block');
  }

  return { front: match[1] ?? '', body: match[2] ?? '' };
};

// A comma-separated string is accepted too: easy to type by hand
const tagsSchema = z
  .union([
    z.array(z.string()),
    z
      .string()
      .transform((value) => value.split(',').map((tag) => tag.trim())),
  ])
  .default([]);

// Only the article fields; the review notes (model, tokens, overlap, ...) are ignored
export const frontMatterSchema = z.object({
  title: z.string('title is required'),
  description: z.string('description is required'),
  category: z.enum(ArticleCategory, 'category must be NEWS or LONGREAD'),
  subcategory: z.string().nullable().default(null).transform(toSubcategory),
  isWarInUkraine: z
    .boolean('isWarInUkraine must be true or false')
    .default(false),
  isFeatured: z.boolean('isFeatured must be true or false').default(false),
  tags: tagsSchema,
  mainPicture: z.string('mainPicture is required'),
  // Absent, null and "" all mean "no credit": the line is only a place to fill in
  photoCredit: z
    .string()
    .nullish()
    .transform((value) => value?.trim() || undefined),
  source: z.string('source is required'),
  sourceLink: z.string('sourceLink is required'),
  publishedAs: z.string().optional(),
});

// Passages that repeat the source are marked with ** (bold). Whatever the owner left
// in the text is removed on publishing, but only when the draft's own review note says
// the draft was highlighted that way (delete the note line to keep real bold).
// <mark> tags (an earlier marker) are always removed.
export const stripHighlights = (
  body: string,
  { boldHighlights = false }: { boldHighlights?: boolean } = {},
): string => {
  const withoutMarks = body.replace(/<\/?mark>/gi, '');

  return boldHighlights ? withoutMarks.replaceAll('**', '') : withoutMarks;
};

// The review note of a highlighted draft talks about "**bold**": this is how it is recognized
export const usesBoldHighlights = (frontText: string): boolean =>
  frontText.includes('**bold**');

export const toArticleDraft = (
  front: unknown,
  body: string,
  options: { boldHighlights?: boolean } = {},
): { article: ArticleDraft; publishedAs?: string } => {
  const parsed = frontMatterSchema.safeParse(front);

  if (!parsed.success) {
    throw new Error(
      `The front matter is not valid:\n${z.prettifyError(parsed.error)}`,
    );
  }

  const { publishedAs, ...fields } = parsed.data;

  return {
    article: { ...fields, body: stripHighlights(body, options).trim() },
    publishedAs,
  };
};

export const findCyrillicFields = (article: ArticleDraft): string[] => {
  const fields: Record<string, string> = {
    title: article.title,
    description: article.description,
    body: article.body,
    tags: article.tags.join(' '),
  };

  return Object.entries(fields)
    .filter(([, value]) => CYRILLIC.test(value))
    .map(([field]) => field);
};

// Changes only the front matter and leaves every other byte of the file as it was
export const editFrontMatter = (
  text: string,
  edit: (front: string) => string,
): string => {
  const match = new RegExp(DRAFT_PATTERN.source, 'd').exec(text);
  const span = match?.indices?.[1];

  if (!span) {
    throw new Error('The file has no front matter: it must start with a --- block');
  }

  return text.slice(0, span[0]) + edit(text.slice(span[0], span[1])) + text.slice(span[1]);
};

export const setMainPicture = (text: string, url: string): string =>
  editFrontMatter(text, (front) => {
    if (!/^mainPicture:.*$/m.test(front)) {
      throw new Error('The front matter has no mainPicture line');
    }

    return front.replace(/^mainPicture:.*$/m, `mainPicture: ${JSON.stringify(url)}`);
  });

// Fills the photoCredit line, or adds it under mainPicture when an older draft has none
export const setPhotoCredit = (text: string, credit: string): string =>
  editFrontMatter(text, (front) => {
    const line = `photoCredit: ${JSON.stringify(credit)}`;

    if (/^photoCredit:.*$/m.test(front)) {
      return front.replace(/^photoCredit:.*$/m, () => line);
    }

    if (!/^mainPicture:.*$/m.test(front)) {
      throw new Error('The front matter has no mainPicture line');
    }

    const eol = front.includes('\r\n') ? '\r\n' : '\n';

    return front.replace(/^mainPicture:.*$/m, (mainPicture) => `${mainPicture}${eol}${line}`);
  });

// Warnings that were true until a picture was attached and are only noise afterwards
const PICTURE_WARNING =
  /No --image given|The picture was not uploaded|--image=page needs/;

export const dropPictureWarnings = (text: string): string =>
  editFrontMatter(text, (front) => {
    const lines = front.split(/\r?\n/);
    const start = lines.findIndex((line) => /^warnings:\s*$/.test(line));

    if (start === -1) {
      return front;
    }

    let end = start + 1;

    while (end < lines.length && /^\s+- /.test(lines[end] ?? '')) {
      end += 1;
    }

    const kept = lines
      .slice(start + 1, end)
      .filter((line) => !PICTURE_WARNING.test(line));

    return [
      ...lines.slice(0, start),
      ...(kept.length > 0 ? ['warnings:', ...kept] : []),
      ...lines.slice(end),
    ].join(front.includes('\r\n') ? '\r\n' : '\n');
  });

// Remembers the slug in the draft itself, so the same file is not published twice
export const addPublishedMarks = (text: string, slug: string): string => {
  const closing = CLOSING_DELIMITER.exec(text);

  if (!closing) {
    throw new Error('The file has no closing --- of the front matter');
  }

  const marks = `\npublishedAs: ${JSON.stringify(slug)}\npublishedOn: ${JSON.stringify(new Date().toISOString())}`;

  return text.slice(0, closing.index) + marks + text.slice(closing.index);
};
