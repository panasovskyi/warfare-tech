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
  source: z.string('source is required'),
  sourceLink: z.string('sourceLink is required'),
  publishedAs: z.string().optional(),
});

// ** only marks passages that repeat the source: the site's body is plain text
export const stripHighlights = (body: string): string =>
  body.replaceAll('**', '');

export const toArticleDraft = (
  front: unknown,
  body: string,
): { article: ArticleDraft; publishedAs?: string } => {
  const parsed = frontMatterSchema.safeParse(front);

  if (!parsed.success) {
    throw new Error(
      `The front matter is not valid:\n${z.prettifyError(parsed.error)}`,
    );
  }

  const { publishedAs, ...fields } = parsed.data;

  return {
    article: { ...fields, body: stripHighlights(body).trim() },
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

// Remembers the slug in the draft itself, so the same file is not published twice
export const addPublishedMarks = (text: string, slug: string): string => {
  const closing = CLOSING_DELIMITER.exec(text);

  if (!closing) {
    throw new Error('The file has no closing --- of the front matter');
  }

  const marks = `\npublishedAs: ${JSON.stringify(slug)}\npublishedOn: ${JSON.stringify(new Date().toISOString())}`;

  return text.slice(0, closing.index) + marks + text.slice(closing.index);
};
