import { z } from 'zod';
import { toSubcategory } from '../article/article';
import { ArticleType, type ArticleDraft } from "../article/article.schema";

// Шапка між двома --- і текст після неї
const DRAFT_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
// Закриваюче --- шапки: перед ним дописуємо publishedAs
const CLOSING_DELIMITER = /\r?\n---\r?\n/;
// Кирилична літера
const CYRILLIC = /\p{Script=Cyrillic}/u;

// Ділить файл на шапку (YAML) і текст статті; без шапки — помилка
export const splitDraft = (text: string): { front: string; body: string } => {
  const match = DRAFT_PATTERN.exec(text.replace(/^﻿/, ''));

  if (!match) {
    throw new Error('The file has no front matter: it must start with a --- block');
  }

  return { front: match[1] ?? '', body: match[2] ?? '' };
};

// Теги можна писати й рядком через кому: так легше набирати руками
const tagsSchema = z
  .union([
    z.array(z.string()),
    z
      .string()
      .transform((value) => value.split(',').map((tag) => tag.trim())),
  ])
  .default([]);

// Лише поля статті; нотатки для перегляду (model, tokens, overlap, ...) ігноруються
export const frontMatterSchema = z.object({
  title: z.string("title is required"),
  description: z.string("description is required"),
  type: z.enum(ArticleType, "type must be NEWS"),
  subcategory: z.string().nullable().default(null).transform(toSubcategory),
  isWarInUkraine: z
    .boolean("isWarInUkraine must be true or false")
    .default(false),
  isFeatured: z.boolean("isFeatured must be true or false").default(false),
  tags: tagsSchema,
  mainPicture: z.string("mainPicture is required"),
  // Відсутнє, null і "" означають «підпису нема»: рядок лише місце, куди його вписати
  photoCredit: z
    .string()
    .nullish()
    .transform((value) => value?.trim() || undefined),
  // Так само: відсутнє, null і "" означають «опису нема» (декоративне фото)
  photoAlt: z
    .string()
    .nullish()
    .transform((value) => value?.trim() || undefined),
  source: z.string("source is required"),
  sourceLink: z.string("sourceLink is required"),
  publishedAs: z.string().optional(),
});

// Місця, що повторюють джерело, позначені ** (жирним). Усе, що власник лишив у тексті,
// видаляється при публікації, але лише коли нотатка самої чернетки каже, що її
// виділено саме так (видали рядок нотатки, щоб зберегти справжній жирний).
// Теги <mark> (попередній маркер) прибираються завжди.
export const stripHighlights = (
  body: string,
  { boldHighlights = false }: { boldHighlights?: boolean } = {},
): string => {
  const withoutMarks = body.replace(/<\/?mark>/gi, '');

  return boldHighlights ? withoutMarks.replaceAll('**', '') : withoutMarks;
};

// Нотатка виділеної чернетки згадує "**bold**": за цим її й упізнають
export const usesBoldHighlights = (frontText: string): boolean =>
  frontText.includes('**bold**');

// Перетворює прочитану шапку й текст на запис статті; хибна шапка — помилка з поясненням
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

// Поля, де лишилась кирилиця: публікація такого не пропускає
export const findCyrillicFields = (article: ArticleDraft): string[] => {
  const fields: Record<string, string> = {
    title: article.title,
    description: article.description,
    body: article.body,
    tags: article.tags.join(' '),
    photoAlt: article.photoAlt ?? '',
  };

  return Object.entries(fields)
    .filter(([, value]) => CYRILLIC.test(value))
    .map(([field]) => field);
};

// Змінює лише шапку й залишає кожен інший байт файла як був
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

// Замінює адресу головного фото в шапці
export const setMainPicture = (text: string, url: string): string =>
  editFrontMatter(text, (front) => {
    if (!/^mainPicture:.*$/m.test(front)) {
      throw new Error('The front matter has no mainPicture line');
    }

    return front.replace(/^mainPicture:.*$/m, `mainPicture: ${JSON.stringify(url)}`);
  });

// Заповнює рядок photoCredit або додає його під mainPicture, коли в старій чернетці його нема
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

// Заповнює рядок photoAlt або додає його під photoCredit (чи mainPicture), коли в старій чернетці його нема
export const setPhotoAlt = (text: string, alt: string): string =>
  editFrontMatter(text, (front) => {
    const line = `photoAlt: ${JSON.stringify(alt)}`;

    if (/^photoAlt:.*$/m.test(front)) {
      return front.replace(/^photoAlt:.*$/m, () => line);
    }

    const anchor = /^photoCredit:.*$/m.test(front)
      ? /^photoCredit:.*$/m
      : /^mainPicture:.*$/m;

    if (!anchor.test(front)) {
      throw new Error('The front matter has no mainPicture line');
    }

    const eol = front.includes('\r\n') ? '\r\n' : '\n';

    return front.replace(anchor, (found) => `${found}${eol}${line}`);
  });

// Попередження, що були правдиві, доки фото не додали, а відтоді — лише шум
const PICTURE_WARNING =
  /No --image given|The picture was not uploaded|--image=page needs/;

// Прибирає з блоку warnings застарілі попередження про фото
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

// Запам'ятовує slug у самій чернетці, щоб той самий файл не опублікували двічі
export const addPublishedMarks = (text: string, slug: string): string => {
  const closing = CLOSING_DELIMITER.exec(text);

  if (!closing) {
    throw new Error('The file has no closing --- of the front matter');
  }

  const marks = `\npublishedAs: ${JSON.stringify(slug)}\npublishedOn: ${JSON.stringify(new Date().toISOString())}`;

  return text.slice(0, closing.index) + marks + text.slice(closing.index);
};
