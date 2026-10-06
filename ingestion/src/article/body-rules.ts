// Тримати в синхроні з IMAGE_HOSTNAME у create-article.schema.ts на сервері та з
// images.remotePatterns у client/next.config.ts. placehold.co — заглушка, res.cloudinary.com — наші фото
export const IMAGE_HOSTNAME = /^(placehold\.co|res\.cloudinary\.com)$/;

// Mirror of checkBodyMarkdown in server/src/article/schemas/create-article.schema.ts: keep
// the two in sync. The body is Markdown, but only what the site renders: paragraphs, links
// over http(s), and images as paragraphs of their own, with a description and a caption,
// from allowed hosts only.
const MAX_BODY_IMAGES = 10;
const IMAGE_IN_BODY = /!\[([^\]]*)\]\(\s*(\S+?)(?:\s+"([^"]*)")?\s*\)/g;
const LINK_IN_BODY = /(?<!!)\[[^\]]*\]\(\s*(\S+?)(?:\s+"[^"]*")?\s*\)/g;
const HTML_IN_BODY = /<\/?[a-z][^>]*>/i;

const isAllowedImage = (address: string): boolean => {
  try {
    const url = new URL(address);

    return url.protocol === 'https:' && IMAGE_HOSTNAME.test(url.hostname);
  } catch {
    return false;
  }
};

const shorten = (text: string): string =>
  text.length > 60 ? `${text.slice(0, 60)}…` : text;

export const checkBodyMarkdown = (body: string): string[] => {
  const problems: string[] = [];

  if (HTML_IN_BODY.test(body)) {
    problems.push('HTML is not allowed in the body: it is Markdown');
  }

  const images = [...body.matchAll(IMAGE_IN_BODY)];

  if (images.length > MAX_BODY_IMAGES) {
    problems.push(`Too many images in the body: ${MAX_BODY_IMAGES} at most`);
  }

  for (const [, alt, address, caption] of images) {
    if (!alt?.trim()) {
      problems.push(
        'Every image in the body needs a description (the text in the square brackets)',
      );
    }

    if (!caption?.trim()) {
      problems.push(
        'Every image in the body needs a caption: ![description](address "caption")',
      );
    }

    if (!address || !isAllowedImage(address)) {
      problems.push(
        `The image "${shorten(address ?? '')}" must be an https address on an allowed image host`,
      );
    }
  }

  for (const paragraph of body.split(/\n\s*\n/)) {
    const found = [...paragraph.matchAll(IMAGE_IN_BODY)];

    if (
      found.length > 0 &&
      !(found.length === 1 && paragraph.trim() === found[0]?.[0])
    ) {
      problems.push(
        'An image in the body must be a paragraph of its own: put a blank line before and after it',
      );
    }
  }

  for (const [, address] of body.matchAll(LINK_IN_BODY)) {
    if (!address || !/^https?:\/\//i.test(address)) {
      problems.push(
        `Links in the body must start with http:// or https:// (found "${shorten(address ?? '')}")`,
      );
    }
  }

  return [...new Set(problems)];
};

// What `npm run upload-image` prints when the description or caption is not given:
// the draft cannot be published until these words are replaced
export const IMAGE_PLACEHOLDERS = {
  alt: 'DESCRIBE THE PHOTO',
  caption: 'CAPTION. Photo: AUTHOR',
} as const;

export const findImagePlaceholders = (body: string): string[] => {
  const found: string[] = [];

  for (const [, alt, , caption] of body.matchAll(IMAGE_IN_BODY)) {
    if (alt === IMAGE_PLACEHOLDERS.alt || caption === IMAGE_PLACEHOLDERS.caption) {
      found.push('An image in the body still has the placeholder description or caption: write the real ones');

      break;
    }
  }

  return found;
};

// Double quotes and line breaks would break the Markdown syntax of the image
const clean = (text: string): string =>
  text.replace(/"/g, "'").replace(/[\r\n]+/g, ' ').replace(/[[\]]/g, '').trim();

export const buildImageMarkdown = (
  address: string,
  alt: string,
  caption: string,
): string =>
  `![${clean(alt) || IMAGE_PLACEHOLDERS.alt}](${address} "${clean(caption) || IMAGE_PLACEHOLDERS.caption}")`;
