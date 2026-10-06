import { Readability } from '@mozilla/readability';
import { JSDOM, VirtualConsole } from 'jsdom';

export class ExtractError extends Error {}

export type ExtractedArticle = {
  title: string;
  text: string;
  // YYYY-MM-DD, as the publisher wrote it; undefined when the page has no date
  publishedAt?: string;
  imageUrl?: string;
};

// The server wants 1000 characters of body: a shorter source is a paywall stub or not an article
const MIN_TEXT_CHARS = 1000;

// jsdom prints every CSS parsing problem of the page: not interesting here
const quiet = () => new VirtualConsole();

const toDay = (value: string | null | undefined): string | undefined => {
  const day = value?.trim().slice(0, 10);

  // The round trip drops impossible dates, so a bad value never reaches the model
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

// TODO: defence-ua.com не віддає дату в метаданих — для нього тут завжди undefined, і дату
// вказують другим аргументом npm start. Можна шукати її в тексті сторінки
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
      // A broken JSON-LD block is common: just try the next one
    }
  }

  return toDay(
    document
      .querySelector('meta[itemprop="datePublished"], meta[name="date"]')
      ?.getAttribute('content'),
  );
};

// getAttribute already turns &amp; into &, which signed image URLs need
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

// Readability's own textContent loses paragraph breaks, so the text is rebuilt from its HTML.
// Captions are left out on purpose: they are not in these tags.
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
  // Scripts are not run and nothing is loaded: jsdom only parses the markup
  const { document } = new JSDOM(html, {
    url: pageUrl,
    virtualConsole: quiet(),
  }).window;

  // Read before Readability: it rewrites the document
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
