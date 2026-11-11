import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Помилка завантаження чи читання фото
export class ImageError extends Error {}

// Максимальний розмір фото
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
// Дозволені формати фото (і для файлів з диска, і для завантажень)
export const LOCAL_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
// Скільки чекаємо на завантаження фото
const TIMEOUT_MS = 20_000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Це не повний захист від SSRF (ім'я, що вказує на приватну адресу, проходить),
// але досить, щоб відсіяти очевидні випадки, поки адресу вводить людина
const isPrivateHost = (hostname: string): boolean => {
  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    return true;
  }

  // IPv6-адреси записуються в дужках
  if (hostname.startsWith('[')) {
    return true;
  }

  const octets = hostname.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);

  if (!octets) {
    return false;
  }

  const first = Number(octets[1]);
  const second = Number(octets[2]);

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

// Перевіряє адресу фото: лише https і не локальна мережа
export const assertImageUrl = (value: string): URL => {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new ImageError(`Not a valid image URL: ${value}`);
  }

  if (url.protocol !== 'https:') {
    throw new ImageError('The image URL must start with https://');
  }

  if (isPrivateHost(url.hostname)) {
    throw new ImageError(`Refusing to download from ${url.hostname}`);
  }

  return url;
};

// SVG навмисно не дозволено: у ньому можуть бути скрипти
export const assertImageResponse = (
  contentType: string | null,
  contentLength: number | null,
): void => {
  const isImage =
    !contentType ||
    /^image\/(jpeg|png|webp|gif|avif)/i.test(contentType) ||
    /^application\/octet-stream/i.test(contentType);

  if (!isImage) {
    throw new ImageError(
      `The URL does not serve a supported image (content-type: ${contentType})`,
    );
  }

  if (contentLength !== null && contentLength > MAX_IMAGE_BYTES) {
    throw new ImageError(
      `The image is too big: ${Math.round(contentLength / 1024 / 1024)} MB, the limit is ${MAX_IMAGE_BYTES / 1024 / 1024} MB`,
    );
  }
};

// Завантажує фото за адресою з усіма перевірками й повертає його вміст
export async function downloadImage(value: string): Promise<Buffer> {
  const url = assertImageUrl(value);

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).catch((error: unknown) => {
    const reason = error instanceof Error ? error.message : String(error);

    throw new ImageError(`Failed to download the image: ${reason}`);
  });

  if (!response.ok) {
    throw new ImageError(
      `Failed to download the image: ${response.status} ${response.statusText}`,
    );
  }

  // Редирект міг відвести від https
  if (!response.url.startsWith('https://')) {
    throw new ImageError('The image URL redirected away from https');
  }

  const length = response.headers.get('content-length');

  assertImageResponse(
    response.headers.get('content-type'),
    length === null ? null : Number(length),
  );

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new ImageError('The image is too big');
  }

  return buffer;
}

// Фото, що вже лежить на цьому комп'ютері: той самий ліміт розміру й ті самі формати, що й для завантаження
export async function readLocalImage(filePath: string): Promise<Buffer> {
  const extension = path.extname(filePath).toLowerCase();

  if (!LOCAL_IMAGE_EXTENSIONS.has(extension)) {
    throw new ImageError(
      `Not a supported image file (${extension || 'no extension'}): use jpg, png, webp, gif or avif`,
    );
  }

  let size: number;

  try {
    size = (await stat(filePath)).size;
  } catch {
    throw new ImageError(`The file does not exist: ${filePath}`);
  }

  if (size > MAX_IMAGE_BYTES) {
    throw new ImageError(
      `The image is too big: ${Math.round(size / 1024 / 1024)} MB, the limit is ${MAX_IMAGE_BYTES / 1024 / 1024} MB`,
    );
  }

  return readFile(filePath);
}
