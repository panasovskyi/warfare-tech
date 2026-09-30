# Warfare Tech — інструкції для Claude

Warfare Tech — англомовний новинний сайт про військові технології (мілтек). Назва — як у репозиторію `panasovskyi/warfare-tech` (скоріш за все остаточна); "SITREP" — стара заглушка, так досі називається локальна тека `d:\sitrep` і макет. Власник проєкту вчиться: після Express освоїв NestJS на цьому бекенді, далі — фронт на Next.js.

## Як працювати

- **Не писати код і не створювати/редагувати файли, поки власник прямо не попросить.** Діє для всього репозиторію (server, client, ingestion). Власник тренується і пише код сам.
- **Пояснювати прозою.** Назви класів, декораторів, методів — так, блоки коду — лише коли прямо попросять ("напиши код", "покажи код"). Навіть ілюстративні приклади в поясненнях — це "написання коду".
- **Коли просять код — давати його текстом у чаті**, а не створювати файли, якщо не сказано інакше ("сам виправ", "створи файл", "додай", "зроби", "дороби", "пропиши", "перенеси", "постав туду").
- **Shell-команди (npm, npx, prisma, git) — давати текстом**, власник запускає їх сам.
- **Можна без дозволу:** читати й переглядати файли, запускати перевірки лише для читання (`npx tsc --noEmit`, `npx eslint`, `npx prettier --check`, GET-запити curl до локальних серверів).
- **Питати перед діями, що змінюють дані:** запити, які пишуть у базу, `prisma migrate`, `git`-операції.
- **Не запускати `prettier --write` на файлах, які власник може редагувати** — це вже раз зіпсувало незбережений буфер у VS Code. Форматувати лише файли, які щойно написав сам; решту — власник через `npm run format`.
- **Не згадувати зауваження лінтера й форматування** (попередження ESLint, лапки, крапки з комою, відступи, "запусти format") у розборах, якщо проблема не критична — не ламає збірку і не ховає справжній баг.
- **Розбір коду — пронумерованими пунктами**, щоб власник відповідав по номерах: "1–3 роби", "4 туду". "Туду" = TODO-коментар у коді на тому місці, українською. Виконані TODO прибирати.
- **Не забігати наперед.** Відповідати рівно на поточний крок; наступні кроки — коротким переліком, без реалізації.
- **Виправляти фактичні помилки** в поясненнях власника і казати про це прямо.
- **Спілкування — українською.** Код, UI і контент сайту — англійською. Коментарі в коді — як у сусідньому коді (TODO — українською).
- **Порівняння** — лише коли корисно. На бекенді основою було Express → Nest. На фронті бази порівняння немає (зрідка Vite).

## Структура репозиторію

```
/            README.md, CLAUDE.md, .vscode/settings.json
/server      NestJS API (свій README)
/client      Next.js 16
/ingestion   AI-рерайт новин за посиланням (буде)
```

`.vscode/settings.json`: `eslint.workingDirectories: ["./client", "./server"]` — ESLint 9 шукає конфіг від робочої теки, без цього розширення VS Code не лінтить монорепо.

## Backend (`server/`)

**Стек:** NestJS 11, Prisma **7** + PostgreSQL + `@prisma/adapter-pg`, Zod 4, `@nestjs/jwt`, bcrypt.

**Граблі, на які вже наступали:**
- Prisma **зафіксована на v7**. `prisma@latest` тягне v8 (Platform CLI), і на ньому npm падає з помилкою `edgesOut`.
- Конфіг Prisma — `prisma7.config.ts`. Там же `migrations.seed`: ключ `"prisma"` у `package.json` Prisma 7 ігнорує.
- `migrate dev` **не запускає** `generate` — після міграції окремо `npm run prisma:generate`, потім перезапуск `start:dev`.
- Згенерований клієнт — `server/generated/prisma`, імпорт `generated/prisma/client` (через `baseUrl`), не `@prisma/client`.
- Сід (`prisma/seed.ts`) запускається через `tsx`: `ts-node` не вміє резолвити `.js`-імпорти згенерованого клієнта.
- Коли поведінка сервера не відповідає коду — перевірити, чи не висить старий процес на порту, і шукати в логах старту `Mapped {...}`.

**Середовище:** API на `http://localhost:5000/api` (глобальний префікс `api`), фронт — `http://localhost:3000` (`CLIENT_URL`, CORS увімкнено). Змінні `.env`: `PORT`, `NODE_ENV`, `CLIENT_URL`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

**Конвенції:**
- Помилки: `ApiError extends HttpException`, тіло `{ message, fieldErrors, formErrors }` — під react-hook-form. Глобальний `ExceptionsFilter`, помилки Prisma — через `handlePrismaError`.
- Валідація: `ZodValidationPipe` на `@Body` / `@Query` / `@Param`. `z.infer` — тип результату після `.transform()`. Для булевих у query — `z.stringbool()`, не `z.coerce.boolean()`. Кілька помилок на різних полях — `superRefine`, не `refine`.
- Сервіси пошуку повертають `null`, а що робити з "не знайдено", вирішує той, хто викликає (контролер кидає `ApiError.notFound`).
- Цілісність даних User (унікальність, хешування пароля) — в `UserService.create`.
- Форма результату запиту: константа в `*.queries.ts` з `satisfies Prisma.<Model>DefaultArgs`, розгортається в запиті, тип — через `Prisma.<Model>GetPayload` у `*.types.ts`. Деталі — `server/PRISMA_TYPES.md`.
- Публічні дані юзера — лише через `select` (білий список). Ніколи `include: { author: true }`: це віддає хеш пароля.
- Авторизація: `JwtGuard` + `@CurrentUser()`, ролі — `RolesGuard` + `@Roles([...])`, `@UseGuards(JwtGuard, RolesGuard)`.
- Публічні запити статей фільтрують `status: PUBLISHED`.
- Схеми **пошуку** не мають бути суворішими за правила **створення** (старі дані мають лишатися досяжними).
- **Правило статті** (`create-article.schema.ts`): NEWS — рівно одне з двох: або `isWarInUkraine`, або `subcategory`. LONGREAD — ні підкатегорії, ні `isWarInUkraine`. Правило живе лише в zod (база його не гарантує); для майбутнього PATCH перевіряти злиту зі збереженою статтю.
- Slug генерується з заголовка + 6-символьний hex-суфікс — не збігається з назвами статичних сторінок фронта.

**Документація бекенду** (`server/`): `SHORT_NEST_FLOW.md`, `ALGORITHM_STEPS.md`, `STEPS_LOGIC.md`, `PRISMA_TYPES.md`. Покрокові конспекти були потрібні для вивчення Nest; для фронта — лише на прохання (є `client/API_CLIENT.md` про обгортку над fetch).

**Відкриті TODO:** фільтр перевіряє `instanceof ApiError` замість `HttpException` (неіснуючі роути дають 500 замість 404); refresh-токен і скорочення `expiresIn` з `30d`; 400 чи 401 для невірного логіну; `Promise.all` для перевірок унікальності в `UserService.create`; e2e-тести auth; enum `Subcategory` перейменувати на `ArticleSubcategory`; поле `readingTime` у стрічці (фронт не має `body`, щоб порахувати); немає поняття "добірка" для Special Report (фільтр за тегом або модель Collection); ендпоінта видалення статті немає.

## Frontend (`client/`)

**Стек:** Next.js **16** (App Router, Turbopack), React 19, TypeScript strict + `noUncheckedIndexedAccess`, SCSS Modules (`sass`), ESLint + Prettier (одинарні лапки, включно з JSX; `eslint-config-prettier/flat`), `next/font` (Manrope, JetBrains Mono через CSS-змінні `--font-manrope`, `--font-jetbrains_mono`).

**Граблі:**
- Next 16 відрізняється від того, що в пам'яті моделі: документація лежить у `client/node_modules/next/dist/docs/` — звірятися з нею (`client/AGENTS.md`).
- `next.config.ts` на Node 22.18+ вантажиться як нативний ESM — немає `__dirname`, тому `process.cwd()`.
- `images.remotePatterns` у формі `new URL(...)` дає `pathname: '/'` і `search: ''` — не пропускає адреси з шляхом і query. Використовувати об'єкт `{ protocol, hostname }`.
- `params` у сторінках — проміс (`await params`); для типів є глобальні `PageProps<'/route'>`, `LayoutProps<'/route'>`.
- `new URL(path, base)` відкидає `/api` з бази — адресу API склеювати рядком.
- `next/image` з `fill` потребує предка з `position: relative` і `sizes`, інакше фото розтягується на весь екран і вантажиться 100vw. Найбільше фото першого екрана — `preload` (у Next 16 замість `priority`).
- `error.tsx` без `'use client'` ламає збірку — 500 віддають усі сторінки, не лише сегмент. У `error.tsx` приходить серіалізована помилка: `instanceof ApiError` там не працює, розрізняти помилки треба на сервері.
- `notFound()` і `permanentRedirect()` працюють через спеціальну помилку: викликати в `catch`, не в `try`, і не ковтати всі помилки порожнім `catch`.
- JSX прибирає пробіл, якщо текст і тег (іконка, посилання) стоять на різних рядках — відстань задавати `inline-flex` + `gap` або явним `{' '}`.

**Середовище:** `client/.env.local`: `API_URL=http://localhost:5000/api` — без `NEXT_PUBLIC_`, бо всі запити йдуть із серверних компонентів.

**Структура `client/src/`:**
- `app/` — роути. `app/_components/` — секції лише головної: `HeroSection` (featured-новина, її заголовок — `h1` сторінки), `WarInUkraineSection`, `SubcategorySection`, `SpecialReportSection`, `LatestSection`. `app/globals.scss` — кольори (CSS-змінні, `[data-theme='dark']`), reset, глобальний `.container`.
- `app/[slug]/` — сторінка новини: `try/catch` навколо `getArticleBySlug` (`ApiError` 404/400 → `notFound()`, решта кидається далі), розмітка `article` → `header` (крихти, `h1`, лід, автор) / `figure` (фото `fill` + `preload`) / тіло + `aside` / `footer` (теги `ul`, джерело, картка автора). Поруч `error.tsx` і `not-found.tsx` — поки тестові заглушки.
- `components/icons/` — `IconBase` (сітка 24×24, `currentColor`, розмір `1em`, `aria-hidden` за замовчуванням) і іконки: `ArrowRight`, `ChevronRight` (ліворуч — `scaleX(-1)` у CSS), `ExternalLink`, `UkraineFlag` (власні кольори), розділи `Air`, `Land`, `Naval`, `Cyber`, `Space`, `Uav`. Намальовані з нуля.
- `components/layout/` — `Logo` (плитка "wt" + назва; `markOnly` — лише знак), `Header` (`nav aria-label='Main'`), `Footer` (`nav aria-label='Footer'`, заголовки груп `h2`). Обидва з `.container` всередині; **ще не підключені** в `layout.tsx`.
- `features/article/` — домен статей: `article.types.ts`, `article.api.ts` (`articleApi.getArticles`, `getArticleBySlug`), `components/` — `ArticleCardHorizontal`, `ArticleCardCompact`, `ArticleCardVertical`, `ArticleHeadline`. `article.constants.ts` і `article.utils.ts` поки порожні (мапа розділів і `getArticlePath` будуть заново).
- `lib/api/` — `client.ts` (обгортка над `fetch`: `api.get`/`api.post`, `params`, опції Next `cache`/`next`), `api-error.ts` (`ApiError`: `status`, `fieldErrors`, `formErrors`), `pagination.ts` (`PaginatedResponse<T>`).
- `styles/` — `variables.scss` (SCSS-токени), `breakpoints.scss` (`$bp-*`, міксин `bp-up`). Підключення: `@use 'variables' as *` — через `sassOptions.loadPaths`, без відносних шляхів.

**Конвенції:**
- Axios не використовуємо: кешування і дедуплікація запитів у Next побудовані на нативному `fetch`.
- Типи дзеркалять JSON сервера: дати — ISO-рядки, необов'язкові колонки — `null`. Параметри запитів — `type`, не `interface` (інакше не присвоюються `Record` у `params`).
- Перерахування — об'єкт `as const` + однойменний тип (як генерує Prisma), не TS `enum`. Тип з ключів мапи — через `keyof typeof` + `satisfies`.
- Дані головної тягне сторінка: `Promise.allSettled`, помилки логуються циклом, секції отримують масив статей пропсом. Секція з порожнім масивом повертає `null`. Компоненти не мають зовнішніх відступів — відступи між блоками задає сторінка.
- Картки: поки три окремі (Horizontal — фото зліва, мітка, заголовок, автор, час; Compact — фото + заголовок; Vertical — фото, заголовок, опис, час) з однаковими пропсами `article` + `headingLevel` (за замовчуванням 3). Порівняти і злити (або зібрати зі спільних частин) — пізніше, можлива ще четверта. `ArticleHeadline` — рядок без фото: заголовок-посилання + необов'язковий час (`isShowTime`).
- Посилання в картці — лише на заголовку, `::after` розтягує клік на всю картку; інші посилання — `position: relative` + `z-index`. Декоративне фото поруч із заголовком — `alt=""`.
- Семантика: один `h1` на сторінку (на головній — у hero), блоки — `section` + `aria-labelledby` з `h2`, картки — `article` з `h3`; `id` заголовків унікальні (в `SubcategorySection` будуються з підкатегорії); однотипні елементи — `ul`/`li`; дата — `time dateTime`.
- Верстка поки лише під десктоп; `.container` — контент до 1400px + поля `$gutter`. Модулі стилів — BEM (`block__element`).

**Схема адрес:**
- `/[slug]` — новина (зараз `app/[slug]`); `/news` — усі новини; `/news/[section]` — розділ: `air`, `land`, `naval`, `cyber`, `space`, `uav`, `ukraine` (один шаблон для всіх).
- Лонгріди — **не вирішено**: окремі `/longreads/[slug]` (свій layout) або так само `/[slug]`, як новини. Список лонгрідів — `/longreads`. `/authors/[login]` — профіль автора.
- В адресі статті — лише незмінне (slug, категорія); підкатегорія може змінитися. Якщо лонгріди отримають окремий роут — сторінки за slug звіряють категорію і редиректять (`permanentRedirect`), якщо стаття з іншого типу. Статичні теки мають пріоритет над кореневим `[slug]`.

**Тестові дані в базі:** 28 новин (по 4 на підкатегорію + 4 War in Ukraine), тег `test-data`, картинки `placehold.co`, featured — "Radar Upgrade Extends Detection Range Against Small Drones". Стара "TEST Claude article: delete me" без тегу — прибрати через Prisma Studio.

**Макет:** https://claude.ai/artifact/QCScCUhPnfhXcHPoJWH5ga — вкладки Homepage, News (сторінка новини, `/news`, розділ `/news/air`) і Logo (варіанти A–L). Макет не остаточний, у ньому ще назва-заглушка SITREP; навігація на головній (Sea, Industry, Analysis) не збігається з реальними розділами.

**Бренд:** логотип — варіант K: заокруглена плитка кольору `--color-accent` з білими "wt", намальованими лініями (не шрифтом), поруч назва "Warfare Tech" (Manrope 800). Компонент `components/layout/Logo`; розмір від `font-size` батька (знак 1.35em).

**Стиль:** чистий, сучасний, мінімалістичний — у дусі twz.com. Білий фон, заокруглення, багато повітря, один стриманий акцент, sans-serif. **Уникати** поєднання насиченого червоного з темно-синім, "офіційних" підписів моноширинним капсом і serif-курсиву — власник асоціює це зі старими радянськими газетами. Контраст: `--color-text-faint` (#9ca3af) на білому не проходить для тексту; кольори Land/Naval/UAV як дрібний текст — лише темніші відтінки.

Блок "War in Ukraine" на головній показує лише новини (`isWarInUkraine`), лонгріди туди не потрапляють (і за правилом сервера не можуть мати цієї позначки).

**Відкриті TODO фронта** (деталі — TODO-коментарі в коді):
- **Наступний етап — стилі** (новий чат): спершу підключити Header / `<main>` / Footer у `layout.tsx`, потім каркас (`body`, `.container`, хедер, футер), обгортки фото в картках (без них фото з `fill` розтягуються на всю сторінку), секції головної, сторінка статті. Усі `.module.scss`, крім `Logo`, порожні; `sizes` у `next/image`.
- `app/[slug]`: винести `try/catch` у `getArticleOrNotFound(slug)`; хлібні крихти (`nav` + `ol`); блок джерела (`null`, пробіл, `<a>`, `aria-label` для нової вкладки); формат `body` (текст чи Markdown — не вирішено); `error.tsx`/`not-found.tsx` англійською + кореневі `app/not-found.tsx`, `app/error.tsx`; `generateMetadata` — перед продом.
- Hero: фото на фон — `next/image` з `fill`, `preload`, `sizes="100vw"`, градієнт через `::after`, текст над ним (`z-index`).
- Хедер: News, Ukraine, Longreads у меню; Search і Subscribe; активний пункт — `usePathname` у маленькому клієнтському компоненті. Футер: соцмережі — окремим списком поза `nav`.
- Сторінки `/news`, `/news/[section]`, `/authors/[login]`, `/longreads`.
- Мапа розділів і `getArticlePath` заново — одне джерело для навігації хедера й футера та `/news/[section]`; функція в `lib/api` для результатів `allSettled`; позиційна прив'язка запитів головної → `map` по підкатегоріях.
- Функції в `lib/`: відносний час ("2h ago"), ініціали для аватара; мітка й колір статті (не завжди підкатегорія).
- Дублі між блоками головної — рішення про дизайн; дані для Special Report.
- `layout.tsx`: розсилка, `metadata`, favicon (`app/icon.svg` зі знаком K, видалити `favicon.ico`), стартові svg у `public/`, перемикач теми.
