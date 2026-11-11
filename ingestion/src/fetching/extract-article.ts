import { Readability } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';

export class ExtractError extends Error {}

export type ExtractedArticle = {
  title: string;
  text: string;
  publishedAt?: string;
  imageUrl?: string;
};

const MIN_TEXT_CHARS = 1000;

const quiet = () => new VirtualConsole();

const toDay = (value: string | null | undefined): string | undefined => {
  const day = value?.trim().slice(0, 10);

  if (
    day &&
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    !Number.isNaN(new Date(`${day}T00:00:00Z`).getTime()) &&
    new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day
  ) {
    return day;
  }

  return undefined;
};

const findDatePublished = (node: unknown): string | undefined => {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findDatePublished(item);

      if (found) {
        return found;
      }
    }

    return undefined;
  }

  if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;

    if (typeof record.datePublished === 'string') {
      return record.datePublished;
    }

    for (const value of Object.values(record)) {
      const found = findDatePublished(value);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
};

const readPublishedAt = (document: Document): string | undefined => {
  const fromMeta = toDay(
    document
      .querySelector('meta[property="article:published_time"]')
      ?.getAttribute('content'),
  );

  if (fromMeta) {
    return fromMeta;
  }

  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    try {
      const day = toDay(findDatePublished(JSON.parse(script.textContent ?? '')));

      if (day) {
        return day;
      }
    } catch {
    }
  }

  return toDay(
    document
      .querySelector('meta[itemprop="datePublished"], meta[name="date"]')
      ?.getAttribute('content'),
  );
};

const readImageUrl = (document: Document, pageUrl: string): string | undefined => {
  const value = (
    document.querySelector('meta[property="og:image"]') ??
    document.querySelector('meta[name="twitter:image"]')
  )?.getAttribute('content');

  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, pageUrl).href;
  } catch {
    return undefined;
  }
};

const toParagraphs = (html: string): string => {
  const { document } = new JSDOM(html, { virtualConsole: quiet() }).window;
  const lines: string[] = [];

  for (const element of document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li')) {
    const line = (element.textContent ?? '').replace(/\s+/g, ' ').trim();

    if (line && line !== lines.at(-1)) {
      lines.push(line);
    }
  }

  return lines.join('\n\n');
};

export const extractArticle = (html: string, pageUrl: string): ExtractedArticle => {
  const { document } = new JSDOM(html, {
    url: pageUrl,
    virtualConsole: quiet(),
  }).window;

  const publishedAt = readPublishedAt(document);
  const imageUrl = readImageUrl(document, pageUrl);

  const article = new Readability(document).parse();

  if (!article) {
    throw new ExtractError('Could not find an article on the page: copy the text into a file instead');
  }

  const text =
    toParagraphs(article.content ?? '') ||
    (article.textContent ?? '')
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n\n');

  if (text.length < MIN_TEXT_CHARS) {
    throw new ExtractError(
      `Only ${text.length} characters of text were found (at least ${MIN_TEXT_CHARS} are needed): the page may be behind a paywall. Copy the text into a file and pass the file instead`,
    );
  }

  return {
    title: (article.title ?? '').trim(),
    text,
    publishedAt,
    imageUrl,
  };
};
