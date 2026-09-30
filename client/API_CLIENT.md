# Обгортка над `fetch` — `src/lib/api`

Аналог `axios.create`: одне місце, де задаються базова адреса, заголовки, серіалізація тіла й обробка помилок. Домени (`features/*/*.api.ts`) ходять в API лише через неї.

## Чому `fetch`, а не axios

У Next.js App Router механізми роботи з даними побудовані на нативному `fetch`:

- **Кешування.** Опції `cache` і `next: { revalidate, tags }` передаються прямо у `fetch`. axios на сервері ходить через модуль `http` Node.js, і ці опції йому не передати.
- **Дедуплікація.** Однакові GET-запити через `fetch` в межах одного рендеру виконуються один раз. Наприклад, `generateMetadata` і сторінка статті обидві просять `/articles/:slug`, а реальний запит іде один.
- **Бандл.** Жодної зайвої бібліотеки в клієнтському JavaScript.

## Файли

| Файл           | Що в ньому                                                           |
| -------------- | -------------------------------------------------------------------- |
| `api-error.ts` | клас `ApiError` і перевірка `isApiErrorBody`                         |
| `client.ts`    | функції `buildUrl`, `request` і об'єкт `api` з методами `get`/`post` |

Адреса API лежить у `client/.env.local`: `API_URL=http://localhost:5000/api`. Без префікса `NEXT_PUBLIC_`, бо поки всі запити йдуть із серверних компонентів. Змінна без префікса видна лише серверу, з префіксом — потрапляє в браузерний бандл. Next читає `.env.local` лише під час старту, тож після змін — перезапуск `npm run dev`.

## Використання

```ts
const page = await api.get<PaginatedResponse<ArticleListItem>>('/articles', {
  params: { subcategory: 'AIR', limit: 4, isFeatured: undefined },
  next: { revalidate: 60 },
});
// → GET http://localhost:5000/api/articles?subcategory=AIR&limit=4
```

```ts
try {
  await api.post('/auth/login', { identifier, password });
} catch (error) {
  if (error instanceof ApiError) {
    error.status; // 400
    error.fieldErrors; // { identifier: ['Required field'] }
    error.formErrors; // ['Login and/or password is wrong']
  }
}
```

## Код

### `api-error.ts`

```ts
export type ApiErrorBody = {
  message: string;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string[]>;
  readonly formErrors: string[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = body.fieldErrors ?? {};
    this.formErrors = body.formErrors ?? [];
  }
}

export const isApiErrorBody = (data: unknown): data is ApiErrorBody =>
  typeof data === 'object' &&
  data !== null &&
  'message' in data &&
  typeof data.message === 'string';
```

### `client.ts`

```ts
import { ApiError, isApiErrorBody } from '@/lib/api/api-error';

type HttpMethod = 'GET' | 'POST';

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
```

## Як це працює

### Типи

**`HttpMethod`** — об'єднання рядкових літералів: змінна цього типу може бути лише `'GET'` або `'POST'`. Друкарську помилку на кшталт `'GTE'` TypeScript зловить до запуску. PATCH і DELETE додаються сюди рядком, коли знадобляться.

**`QueryValue`** — що можна передати як значення query-параметра. `null` і `undefined` дозволені навмисно: фільтр можна передавати як є, навіть коли він не заданий, — відсіється він усередині `buildUrl`.

**`RequestOptions`** — тип другого аргументу `api.get` / третього в `api.post`:

- **`RequestInit`** — вбудований тип другого аргументу `fetch`: `method`, `headers`, `body`, `cache`, `signal` тощо. Next розширює його полем `next` (для `revalidate` і `tags`).
- **`Omit<RequestInit, 'method' | 'body' | 'headers'>`** — утилітний тип "усе з `RequestInit`, крім цих ключів":
  - `method` виставляють самі `api.get` / `api.post`;
  - `body` передається окремим аргументом, щоб його неможливо було випадково додати до GET (`fetch` на це кидає помилку);
  - `headers` прибрані, щоб переоголосити їх вужче. У `RequestInit` заголовки можуть бути об'єктом класу `Headers`, а розгорнути такий об'єкт через `...` — отримати `{}`: заголовки мовчки загубляться. Тому дозволений лише звичайний об'єкт.
- **`& { ... }`** — перетин типів: до того, що лишилося, додаються свої поля — `params` (як в axios) і `headers` у вужчій формі. Обидва з `?`: це опції, нічого з них не обов'язкове.
- **`export`** — щоб тип можна було використати в доменних `*.api.ts`.

### `buildUrl` — збирає адресу

1. Шаблонний рядок склеює базу і шлях: `http://localhost:5000/api` + `/articles`.
2. `new URL(...)` перетворює результат на об'єкт з полем `searchParams`. Воно саме кодує спецсимволи (пробіли, `&`, `?`) у значеннях.
3. `if (params)` — якщо параметрів не передали, цикл пропускається.
4. `Object.entries(params)` перетворює об'єкт на масив пар `[ключ, значення]`, а `for...of` з деструктуризацією `[key, value]` проходить по кожній.
5. Значення `undefined` і `null` пропускаються. Без цього в адресу пішло б `category=undefined`, серверна zod-схема не впізнала б такого значення enum і повернула б 400. axios відкидав їх сам.
6. `searchParams.set` додає `?key=value` (для наступних — `&key=value`). `String(value)` перетворює число і булеве значення на рядок: `4` → `'4'`, `true` → `'true'`. У query все передається рядками, а на сервері `z.coerce.number()` і `z.stringbool()` перетворюють їх назад.
7. `toString()` повертає готову адресу рядком.

> **Чому склеювання рядків, а не `new URL(path, base)`.** Другий варіант не склеює рядки, а розв'язує посилання відносно бази — так само, як браузер обробляє `<a href>` на сторінці. Це стандарт URL, не баг:
>
> | Виклик                                               | Результат                            |
> | ---------------------------------------------------- | ------------------------------------ |
> | `new URL('/articles', 'http://localhost:5000/api')`  | `http://localhost:5000/articles`     |
> | `new URL('articles', 'http://localhost:5000/api')`   | `http://localhost:5000/articles`     |
> | `new URL('/articles', 'http://localhost:5000/api/')` | `http://localhost:5000/articles`     |
> | `new URL('articles', 'http://localhost:5000/api/')`  | `http://localhost:5000/api/articles` |
> | склеювання рядків                                    | `http://localhost:5000/api/articles` |
>
> Шлях зі `/` на початку означає "від кореня домену", тож увесь шлях бази відкидається. Шлях без `/` означає "відносно поточної теки", а база без `/` у кінці вважається файлом `api`, тож він замінюється. axios у `baseURL` просто склеює рядки — звідси інтуїція, що `/api` має зберегтися.

### `request` — через неї проходять усі запити

**Сигнатура.**

- `<T>` — дженерик, тип успішної відповіді. Його задає той, хто викликає: `api.get<ArticleDetails>(...)` поверне `ArticleDetails`.
- `body?: unknown` — будь-які дані, які можна перетворити на JSON; `?` — тіла може не бути.
- `options: RequestOptions = {}` — значення за замовчуванням: якщо опції не передали, буде порожній об'єкт, і деструктуризація нижче не впаде.
- `Promise<T>` — `async`-функція завжди повертає проміс.

**Змінна оточення.** `process.env.API_URL` читається всередині функції, а не на рівні модуля. Якщо файл колись імпортують у браузерний компонент, змінна без `NEXT_PUBLIC_` там буде порожня: перевірка на рівні модуля впала б на самому імпорті, а так помилка зрозуміла і лише під час виклику. Бонус перевірки `if (!baseUrl)`: після неї TypeScript знає, що `baseUrl` — точно `string`, а не `string | undefined`.

**Деструктуризація з rest.** `const { params, headers, ...init } = options` дістає `params` і `headers`, а все інше (`cache`, `next`, `signal`…) збирає в `init`. `params` — наша власна опція, `fetch` про неї не знає; `headers` зливаються з `Content-Type` вручну.

**Виклик `fetch`.** Головна відмінність від axios: `fetch` **успішно** повертає відповідь навіть на 404 чи 500. Помилку він кидає лише тоді, коли запит узагалі не дійшов (сервер лежить, немає мережі) — це вбудований `TypeError`, він свідомо не загорнутий в `ApiError`.

**Об'єкт налаштувань для `fetch`.**

- `...init` стоїть **першим**: коли в об'єкті повторюється ключ, перемагає останній. Тому `method`, `headers` і `body` нижче завжди наші.
- `method` — скорочений запис `method: method`.
- `headers` — умовний spread: якщо є тіло, додається `Content-Type: application/json`, інакше розгортається `{}`, тобто нічого. Заголовки ззовні розгортаються останніми — за потреби можуть перевизначити `Content-Type`.
- `body` — `fetch`, на відміну від axios, сам об'єкти не серіалізує, тому `JSON.stringify`. Немає тіла — `undefined`, і запит іде без тіла.

**Розбір відповіді.** `res.json()` читає тіло й розбирає JSON (теж проміс). `.catch(() => null)` — якщо тіло порожнє або це не JSON (наприклад, HTML-сторінка помилки від проксі), буде `null`, а не нова помилка. Тип `unknown` явно, бо `res.json()` повертає `any`, з яким TypeScript дозволяє все; `unknown` змушує спершу перевірити дані.

**Помилка.** `res.ok` — `true` для статусів 200–299. Інакше кидається `ApiError`:

- статус — як є;
- тіло — з відповіді, якщо воно має форму нашої серверної помилки (`isApiErrorBody`);
- інакше мінімальне тіло з `statusText` ("Not Found", "Internal Server Error"). Запасний `'Request failed'` — бо `statusText` буває порожнім: у HTTP/2 текстового опису статусу немає взагалі.

**`data as T`** — приведення типу: "повір, тут `T`". Під час виконання ніхто цього не перевіряє — типи на фронті лише обіцянка, що сервер повертає саме таку форму.

### Об'єкт `api`

Два методи-скорочення, щоб писати `api.get(...)`, як з axios. Кожен — дженерик-стрілкова функція, що викликає `request` з потрібним методом; `get` передає `undefined` замість тіла. `<T>` з `api.get<T>` прокидається далі в `request<T>`.

### `api-error.ts`

**`isApiErrorBody`** — type guard: функція з типом результату `data is ApiErrorBody`. Коли вона повертає `true`, TypeScript усередині умови вважає `data` типом `ApiErrorBody`, тому в `request` його можна передати в конструктор без приведення. Перевірки по черзі: це об'єкт → не `null` (у JS `typeof null === 'object'` — стара особливість мови) → є поле `message` → `message` — рядок.

**`ApiError`** розширює `Error`, тож це повноцінна помилка зі стеком викликів: її ловить `try/catch` і перевіряє `instanceof`.

- `super(body.message)` задає стандартне поле `message`;
- `name` видно в логах;
- `readonly` — поля не можна перезаписати після створення;
- `?? {}` і `?? []` — значення за замовчуванням для відповідей без `fieldErrors` і `formErrors` (як 500 з нашого сервера, де приходить лише `message`). Далі код може покладатися, що масиви є завжди.

Форма `{ message, fieldErrors, formErrors }` дзеркалить серверний `ApiError` і розрахована на react-hook-form: `fieldErrors` → `setError` на конкретне поле, `formErrors` → помилка всієї форми.

## Що axios робив сам, а тут — вручну

| Що                     | axios                          | Обгортка                                                  |
| ---------------------- | ------------------------------ | --------------------------------------------------------- |
| Базова адреса          | `baseURL`, склеювання рядків   | `API_URL` з `.env.local`, склеювання рядків               |
| Query-параметри        | `params`, відкидає `undefined` | `URLSearchParams`, `undefined`/`null` відкидаються вручну |
| JSON-тіло              | серіалізує сам                 | `JSON.stringify` + заголовок `Content-Type`               |
| Помилка на 4xx/5xx     | кидає сам                      | перевірка `res.ok` → `throw new ApiError`                 |
| Розбір відповіді       | `response.data`                | `await res.json()`                                        |
| Interceptor для токена | `interceptors.request`         | з'явиться на кроці auth                                   |

## Пастки

1. **Обов'язкові поля в опціях.** Якщо в `RequestOptions` написати `params` і `headers` без `?`, рядок `options: RequestOptions = {}` дасть помилку: у `{}` немає обов'язкових полів. Слідом те саме в `buildUrl` — там `params` теж має бути з `?`.
2. **`if (value)` замість перевірки на `undefined`/`null`.** Відкидає всі "хибні" значення: `false`, `0`, `''`. Запит `isFeatured: false` взагалі не дійде до сервера — і замість "не featured" прийдуть усі статті.
3. **Обов'язковий `options` у `post`.** Тоді кожен POST мусить передавати третій аргумент, навіть порожній.
4. **`interface` для параметрів запиту.** Тип на кшталт `GetArticlesParams` оголошуй через `type`: `interface` не можна присвоїти `Record<string, ...>`, і TypeScript видасть незрозумілу помилку на `params`.
5. **`<T>(...) =>` у `.tsx`.** У файлах `.tsx` компілятор прийме `<T>` за JSX-тег — там дженерик-стрілку пишуть як `<T,>(...) =>`. У `.ts` такої проблеми немає.
