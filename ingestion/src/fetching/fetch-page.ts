import { resolveSource } from '../rewriting/sources';

// Помилка завантаження сторінки з поясненням для людини
export class FetchError extends Error {}

// Скільки чекаємо на відповідь сторінки
const TIMEOUT_MS = 25_000;
// Ліміт розміру сторінки
const MAX_HTML_BYTES = 5 * 1024 * 1024;
// Скільки редиректів дозволено пройти
const MAX_REDIRECTS = 4;
// Представляємось звичайним браузером: частина сайтів не віддає сторінку скриптам
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Кожна адреса, яку збираємось запитати, — перша й кожна ціль редиректу —
// має бути https і сайтом з ALLOWED_SOURCES: редирект ніколи не виведе нас за межі списку
export const checkPageUrl = (value: string, base?: string): string => {
  let url: URL;

  try {
    url = new URL(value, base);
  } catch {
    throw new FetchError(`Not a valid page address: ${value}`);
  }

  if (url.protocol !== 'https:') {
    throw new FetchError(`The page address must start with https:// (got ${url.protocol}//)`);
  }

  try {
    resolveSource(url.href);
  } catch {
    throw new FetchError(
      `Refusing to open ${url.hostname}: it is not in ALLOWED_SOURCES (src/rewriting/sources.ts)`,
    );
  }

  return url.href;
};

// Завантажує сторінку, проходячи редиректи вручну. Повертає HTML і кінцеву адресу
export const fetchPage = async (
  value: string,
): Promise<{ html: string; finalUrl: string }> => {
  let url = checkPageUrl(value);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(url, {
      // Редиректи проходимо вручну, щоб перевірити кожну ціль до переходу
      redirect: 'manual',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);

      throw new FetchError(`Failed to open the page: ${reason}`);
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');

      if (!location) {
        throw new FetchError(`The page redirected (HTTP ${response.status}) without a location`);
      }

      url = checkPageUrl(location, url);
      continue;
    }

    if (!response.ok) {
      throw new FetchError(
        `The page answered HTTP ${response.status} ${response.statusText}. Some sites block automated requests: copy the text into a file and pass the file instead`,
      );
    }

    // Нам потрібна саме HTML-сторінка (не PDF і не картинка)
    const contentType = response.headers.get('content-type') ?? '';

    if (!/html/i.test(contentType)) {
      throw new FetchError(`The address does not serve a web page (content-type: ${contentType || 'unknown'})`);
    }

    // Розмір за заголовком: надто велику сторінку відсікаємо ще до завантаження
    const length = Number(response.headers.get('content-length') ?? 0);

    if (length > MAX_HTML_BYTES) {
      throw new FetchError('The page is too big');
    }

    // Заголовок міг бути неправдивим чи відсутнім, тож перевіряємо ще й довжину самого тексту
    const html = await response.text();

    if (html.length > MAX_HTML_BYTES) {
      throw new FetchError('The page is too big');
    }

    return { html, finalUrl: url };
  }

  throw new FetchError(`Too many redirects (more than ${MAX_REDIRECTS})`);
};
