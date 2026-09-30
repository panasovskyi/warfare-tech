import { ApiError, isApiErrorBody } from '@/lib/api/api-error';

type HttpMethod = 'POST' | 'GET';

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = Omit<
  RequestInit,
  'method' | 'body' | 'headers'
> & {
  params?: Record<string, QueryValue>;
  headers?: Record<string, string>;
};

const buildUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, QueryValue>,
): string => {
  const url = new URL(`${baseUrl}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
};

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = process.env.API_URL;

  if (!baseUrl) {
    throw new Error('API_URL is not set in .env.local');
  }

  const { params, headers, ...init } = options;

  const res = await fetch(buildUrl(baseUrl, path, params), {
    ...init,
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      isApiErrorBody(data)
        ? data
        : { message: res.statusText || 'Request failed' },
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
};
