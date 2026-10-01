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

**Відкриті TODO:** фільтр перевіряє `instanceof ApiError` замість `HttpException` (неіснуючі роути дають 500 замість 404); refresh-токен і скорочення `expiresIn` з `30d`; 400 чи 401 для невірного логіну; `Promise.all` для перевірок унікальності в `UserService.create`; e2e-тести auth; enum `Subcategory` перейменувати на `ArticleSubcategory`; поле `readingTime` у стрічці (фронт не має `body`, щоб порахувати); немає поняття "добірка" для Special Report (фільтр за тегом або модель Collection); ендпоінта видалення статті немає; `z.url()` для `sourceLink` і `mainPicture` пропускає будь-яку схему, зокрема `javascript:` — обмежити до http(s) опцією `protocol` (TODO в `create-article.schema.ts`).

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
- З `page.tsx` / `layout.tsx` можна експортувати лише те, що визначає Next (`default`, `generateMetadata`, `metadata`, конфіг сегмента). Будь-який інший експорт (компонент, функція) ламає `next build`: «"X" is not a valid Page export field». Допоміжні компоненти — в окремі файли.
- `notFound()` і `permanentRedirect()` працюють через спеціальну помилку: викликати в `catch`, не в `try`, і не ковтати всі помилки порожнім `catch`.
- `aspect-ratio` + `overflow: hidden` — блок перестає рости під вміст (стає прокручуваним), текст обрізається. Для обрізання по заокругленню, коли блок має рости, — `overflow: clip`.
- Sass: `5 / 2` у змінній — застаріле ділення з попередженням; пропорції писати як `calc(5 / 2)`.
- Шари з від'ємним `z-index` (фото, градієнт під текстом) — лише всередині батька з `isolation: isolate`, інакше підуть під фон сторінки.
- `align-items: baseline` поруч із flex-елементом, у якого першою стоїть іконка (`svg`), вирівнює по низу іконки: у `svg` немає текстової базової лінії. Там — `center`.
- Проміси, створені заздалегідь і дочікувані кількома `await` підряд: той, що впаде під час першого `await`, дасть unhandled rejection — обробника в нього ще немає. `allSettled` (чи інший обробник) чіпляти одразу, до першого `await`.
- JSX прибирає пробіл, якщо текст і тег (іконка, посилання) стоять на різних рядках — відстань задавати `inline-flex` + `gap` або явним `{' '}`.

**Середовище:** `client/.env.local`: `API_URL=http://localhost:5000/api` — без `NEXT_PUBLIC_`, бо всі запити йдуть із серверних компонентів.

**Структура `client/src/`:**
- `app/` — роути. `app/_components/` — секції лише головної: `HeroSection` (featured-новина, її заголовок — `h1` сторінки; фото `fill` + `preload` фоном картки, градієнт `--gradient-image-overlay` у `::after`, текст `--color-on-image`), `WarInUkraineSection`, `SubcategorySection`, `SpecialReportSection`, `LatestSection`. `app/globals.scss` — кольори (CSS-змінні, `[data-theme='dark']`), reset (без відступів браузера; заголовки успадковують розмір і вагу; списки без маркерів), `:focus-visible` (`--color-focus`), `--color-border-translucent` (межа на тонованих панелях, де `--color-border` не видно), `--color-cat-*-text` (колір розділу як текст: Land, Naval, UAV — темніші відтінки, решта = базові; для темної теми ще не підібрані — TODO в темному блоці), `body`-колонка з `main { flex-grow: 1 }` — футер унизу на коротких сторінках, глобальний `.container`. `app/page.module.scss` — відступи між блоками головної і сітка підкатегорій.
- `app/[slug]/` — сторінка новини: `try/catch` навколо `getArticleBySlug` (`ApiError` 404/400 → `notFound()`, решта кидається далі), розмітка `article` → `header` (крихти, `h1`, лід, автор) / `figure` (фото `fill` + `preload`) / тіло + `aside` / `footer` (теги `ul`, джерело, картка автора). Поруч `error.tsx` і `not-found.tsx` — поки тестові заглушки.
- `components/icons/` — `IconBase` (сітка 24×24, `currentColor`, розмір `1em`, `aria-hidden` за замовчуванням) і іконки: `ArrowRight`, `ChevronRight` (ліворуч — `scaleX(-1)` у CSS), `ExternalLink`, `UkraineFlag` (власні кольори), розділи `Air` (реактивний літак згори), `Land` (танк), `Naval` (корабель із вимпелом), `Space` (супутник), `Cyber` (мікросхема), `Uav` (дрон спереду з камерою). Намальовані з нуля й заповнюють сітку 2–22; перевіряти рендером на 24 і 48px. Граблі: щогла з поперечкою читається як хрест, квадрокоптер згори — як символ ⌘.
- `components/ui/` — `RelativeTime` (`time` з `dateTime` і текстом з `formatRelativeTime`; стилі — через `className` від батька). Рахується на сервері, тож застаріває разом із кешем сторінки; якщо колись треба живий час — клієнтський компонент робити тут. `Avatar` (коло з ініціалами з `getInitials`; `aria-hidden` усередині; `size` 's' | 'm' | 'l' — модифікатори `avatar--*`, коло й шрифт разом; тло від батька через `className`; згодом — фото з ініціалами як запасом). `EmptyState` (заглушка порожнього списку: `title` + необов'язковий `description`, панель на `--color-surface`; текст — абзаци, не заголовок).
- `components/layout/` — `Logo` (плитка "wt" + назва; `markOnly` — лише знак), `Header` (`nav aria-label='Main'`), `Footer` (`nav aria-label='Footer'`, заголовки груп `h2`). Обидва з `.container` всередині, підключені в `layout.tsx`: Header / `main` / Footer. `globals.scss` імпортується перед ними — порядок CSS у Next = порядок імпортів.
- `features/article/` — домен статей: `article.types.ts`, `article.api.ts` (`articleApi.getArticles`, `getArticleBySlug`), `components/` — `ArticleCardHorizontal`, `ArticleCardCompact`, `ArticleCardVertical`, `ArticleHeadline`, `ArticleBreadcrumbs` (`nav aria-label='Breadcrumb'` + `ol`: News › розділ, для лонгріда — Longreads; дані з `getSectionTagAndLink`, колір через `data-section`, іконка з `SECTION_ICONS`, шеврон — `ChevronRightIcon`), `ArticleByline` (автор + `RelativeTime` в одному рядку; колір і розмір — від батька через `className`; у Hero і Horizontal). `article.constants.ts` — `NEWS_SECTIONS` (мапа розділів: ключ — сегмент адреси `/news/<key>`, `label`, `filter` — що розділ додає до запиту; `ukraine` — `isWarInUkraine`) і тип `NewsSectionKey`. `article.utils.ts` — `getSectionTagAndLink(article)` → `{ label, href, section }`: мітка статті (Longread / War in Ukraine / розділ з `NEWS_SECTIONS` / запасне News); `section` (`ArticleLabelSection`) — ключ кольору для `data-section`; `getArticlePath` буде там же. У Hero мітка — плашка кольору розділу з білим текстом: кольоровий текст на темному фото дає ≈3:1.
- `lib/api/` — `client.ts` (обгортка над `fetch`: `api.get`/`api.post`, `params`, опції Next `cache`/`next`), `api-error.ts` (`ApiError`: `status`, `fieldErrors`, `formErrors`), `pagination.ts` (`PaginatedResponse<T>`; `getItemsOrEmpty` — результат `allSettled` або `undefined` → `items` чи `[]`). `lib/date.ts` — `formatRelativeTime`: "now" / "5 mins ago" / "3 hours ago" / "yesterday" (за календарем) / "Sep 27" / "Sep 27, 2025" (інший рік); часовий пояс явно `Europe/Dublin` (власник у Дубліні); невалідна дата → порожній рядок.
- `styles/` — `variables.scss` (SCSS-токени), `breakpoints.scss` (`$bp-*`, міксин `bp-up`). Підключення: `@use 'variables' as *` — через `sassOptions.loadPaths`, без відносних шляхів. Шкала відступів: `$space-N` = N×4 px (`$space-5` = 20, `$space-12` = 48); пропуски в нумерації навмисні — нове значення бере свій номер без перейменувань. Кільце фокуса — `$focus-ring-width`, `$focus-ring-offset`.

**Конвенції:**
- Axios не використовуємо: кешування і дедуплікація запитів у Next побудовані на нативному `fetch`.
- Типи дзеркалять JSON сервера: дати — ISO-рядки, необов'язкові колонки — `null`. Параметри запитів — `type`, не `interface` (інакше не присвоюються `Record` у `params`).
- Перерахування — об'єкт `as const` + однойменний тип (як генерує Prisma), не TS `enum`. Тип з ключів мапи — через `keyof typeof` + `satisfies`.
- Дані головної тягне сторінка. Запити й секції підкатегорій — `map` по `HOMEPAGE_SUBCATEGORIES` (ключі `NEWS_SECTIONS`), тож розійтися не можуть; вручну лише featured, Ukraine і Latest. Обидва `allSettled` викликаються до `await` і чекаються разом через `Promise.all`. Помилки — `logIfRejected` з назвою блоку. Секції отримують масив статей пропсом. Порожня секція: Latest і War in Ukraine показують заголовок і `EmptyState` з нейтральним текстом (порожньо і коли запит упав, і коли новин немає); `SubcategorySection` повертає `null`. Посилання на розділ ("View all", "View full coverage") — коли секція не порожня: секція бачить лише показані статті, `total` до неї не доходить. Компоненти не мають зовнішніх відступів — відступи між блоками задає сторінка, через `gap` у flex/grid: секція, що повернула `null`, не лишає зайвого відступу.
- Картки: поки три окремі (Horizontal — фото зліва, мітка, заголовок, автор, час; Compact — фото + заголовок; Vertical — фото, заголовок, опис, час) з однаковими пропсами `article` + `headingLevel` (за замовчуванням 3). Порівняти і злити (або зібрати зі спільних частин) — пізніше, можлива ще четверта. `ArticleHeadline` — рядок без фото: заголовок-посилання + необов'язковий час (`isShowTime`).
- Посилання в картці — лише на заголовку, `::after` розтягує клік на всю картку; інші посилання — `position: relative` + `z-index`. Декоративне фото поруч із заголовком — `alt=""`.
- Фото в картці: обгортка `card__imageWrapper` (`position: relative`, `aspect-ratio` з токена `$ratio-card` / `$ratio-thumb`, `overflow: hidden`, фон `--color-surface-2`) + `card__image` (`object-fit: cover`). `sizes` — необов'язковий пропс; за замовчуванням — під основне місце картки (розрахунок у коментарі біля `DEFAULT_SIZES`). Hover — підкреслення заголовка кольором акценту. Час — завжди `RelativeTime`; автор + час — `ArticleByline`, не `author && …` в одному компоненті. Час окремо — `$font-mono` `$fs-xs`, у рядку з автором — звичайним шрифтом. Мітка в Horizontal — з `getSectionTagAndLink`, кольоровим текстом капсом (на білому `-text` варіанти проходять).
- Колір розділу — атрибут `data-section="<ключ NEWS_SECTIONS>"` на елементі; глобальне правило в `globals.scss` (цикл `@each`) кладе в нього `--section-color` (`--color-cat-*-text`, Ukraine — синій прапора; `longread`/`news` — `initial`, щоб не успадкувати колір батьківської секції). Модулі лише беруть `var(--section-color, <запасний>)`: мітка картки — колір тексту, мітка hero — тло плашки, `SubcategorySection` — назва й іконка (16px капсом; іконки — мапа `SECTION_ICONS` у секції, компоненти з `satisfies Record<…>`, розмір 24px через `font-size`). Заголовок підкатегорії — `label` з мапи, капсом через CSS (рішення дизайну).
- Підписи в даних — звичайним регістром ("Air", "War in Ukraine"); великі літери, де треба, — `text-transform: uppercase` у CSS. Капс у розмітці скрінрідер може читати по літерах, як абревіатуру.
- Семантика: один `h1` на сторінку (на головній — у hero), блоки — `section` + `aria-labelledby` з `h2`, картки — `article` з `h3`; `id` заголовків унікальні (в `SubcategorySection` будуються з підкатегорії); однотипні елементи — `ul`/`li`; дата — `time dateTime`.
- Верстка поки лише під десктоп; `.container` — контент до 1400px + поля `$gutter`. Модулі стилів — BEM (`block__element`).

**Схема адрес:**
- `/[slug]` — новина (зараз `app/[slug]`); `/news` — усі новини; `/news/[section]` — розділ: `air`, `land`, `naval`, `cyber`, `space`, `uav`, `ukraine` (один шаблон для всіх).
- Лонгріди — **не вирішено**: окремі `/longreads/[slug]` (свій layout) або так само `/[slug]`, як новини. Список лонгрідів — `/longreads`. `/authors/[login]` — профіль автора.
- В адресі статті — лише незмінне (slug, категорія); підкатегорія може змінитися. Якщо лонгріди отримають окремий роут — сторінки за slug звіряють категорію і редиректять (`permanentRedirect`), якщо стаття з іншого типу. Статичні теки мають пріоритет над кореневим `[slug]`.

**Тестові дані в базі:** 28 новин (по 4 на підкатегорію + 4 War in Ukraine), тег `test-data`, картинки `placehold.co`, featured — "Radar Upgrade Extends Detection Range Against Small Drones". Стара "TEST Claude article: delete me" без тегу — прибрати через Prisma Studio.

**Макет:** https://claude.ai/artifact/QCScCUhPnfhXcHPoJWH5ga — вкладки Homepage, News (сторінка новини, `/news`, розділ `/news/air`) і Logo (варіанти A–L). Макет не остаточний, у ньому ще назва-заглушка SITREP; навігація на головній (Sea, Industry, Analysis) не збігається з реальними розділами. Сторінки News у макеті новіші (виправлені контраст і фокус) — де розходяться з головною, орієнтуватися на них. Значення з макета — орієнтир: у коді лише токени, значення без токена — обговорити.

**Бренд:** логотип — варіант K: заокруглена плитка кольору `--color-accent` з білими "wt", намальованими лініями (не шрифтом), поруч назва "Warfare Tech" (Manrope 800). Компонент `components/layout/Logo`; розмір від `font-size` батька (знак 1.35em).

**Стиль:** чистий, сучасний, мінімалістичний — у дусі twz.com. Білий фон, заокруглення, багато повітря, один стриманий акцент, sans-serif. **Уникати** поєднання насиченого червоного з темно-синім, "офіційних" підписів моноширинним капсом і serif-курсиву — власник асоціює це зі старими радянськими газетами. Контраст: `--color-text-faint` (#9ca3af) на білому не проходить для тексту; кольори Land/Naval/UAV як дрібний текст — лише темніші відтінки; акцент #ff5a1f як дрібний текст — 3.1:1 (у News-макеті посилання кольору ink, акцентні лише стрілка й підкреслення). Кільце фокуса — `--color-focus` (#e14512): чистий акцент на тонованих панелях дає менше 3:1.

Блок "War in Ukraine" на головній показує лише новини (`isWarInUkraine`), лонгріди туди не потрапляють (і за правилом сервера не можуть мати цієї позначки).

**Відкриті TODO фронта** (деталі — TODO-коментарі в коді):
- **Етап стилів** (у роботі). Головна застилізована вся: шкала відступів, каркас (`layout.tsx`, reset, `:focus-visible`), `page.module.scss`, hero (картка в контейнері, як у макеті), хедер, футер (сітка — під поточну розмітку; після винесення соцмереж з `nav` поміняється), три картки, `ArticleHeadline`, `ArticleByline`, секції War in Ukraine, Subcategory, Latest і Special Report (Special — лише панель і сітка; заглушки `article__*` замінить `ArticleCardCompact`). Сторінка статті теж застилізована (`ArticleDetails.module.scss`): шапка (крихти, `h1` 48px, лід, автор — аватар + ім'я над датою), фото `$ratio-article`, сітка текст 720 + `aside` 340 (липкий), футер шириною колонки тексту (теги, джерело, картка автора). `body` — `white-space: pre-line`, доки не вирішено абзаци чи Markdown. Нові токени: `$lh-loose` (1.75), `$space-20`, `$space-24`, `$article-text-width`, `$article-aside-width`, `$ratio-article`.
- Кешування головної: у Next 16 `fetch` за замовчуванням не кешується — кожен перегляд = 9 запитів до API. Вирішити `use cache` / revalidate (TODO в `page.tsx`); `RelativeTime` тоді застаріватиме на час кешу.
- Коли API недоступний, на головній лишаються дві однакові заглушки (War in Ukraine і Latest) — можливо, одне повідомлення на рівні сторінки. У War in Ukraine підзаголовок списку "Latest news" збігається із заголовком секції Latest (у макеті там "Latest updates").
- Адреси з двох сегментів (`/news/air`) поки ведуть на стандартну 404 Next — кореневого `app/not-found.tsx` немає; `/news`, `/longreads` потрапляють у `[slug]` → запит до API → наш not-found.
- Токени, яких бракує, — вирішувати на кроці, де знадобляться: колір мети (#6b6d74 як `--color-text-subtle` або `--color-text-muted`); розміри шрифту 14 і 20 (між `sm` і `base` немає вільної назви); трекінг заголовків (≈ −0.02em); `--color-cat-industry*` — розділу немає, прибрати.
- `app/[slug]`: `getArticleOrNotFound(slug)` написана — лежить у `page.tsx` над сторінкою (notFound — API маршруту, не шару API; та сама функція піде в `generateMetadata`, fetch Next мемоізує — запит буде один), сторінка вже на ній; хлібні крихти — `ArticleBreadcrumbs`; ініціали аватарів — `getInitials` з `lib/text.ts` (аватари `aria-hidden`); час під автором — `RelativeTime`; `aside` — "Latest in <розділ>": другий запит (фільтр розділу; для лонгріда — категорія LONGREAD, для запасного News — NEWS; `limit: 10` — так хоче власник), поточна стаття відкидається за `id`, рядки — `ArticleHeadline`, `h2` + `aria-labelledby`, `data-section` для кольору, без інших статей не рендериться; помилка цього запиту зараз валить усю сторінку — не вирішено (обробити або окремий async-компонент у `<Suspense>`); формат `body` (текст чи Markdown — не вирішено); `error.tsx`/`not-found.tsx` англійською + кореневі `app/not-found.tsx`, `app/error.tsx`; `generateMetadata` — перед продом. Блок джерела готовий (`p`, `<a target='_blank' rel='noopener noreferrer'>`, `aria-label` про нову вкладку). Замість форми підписки під статтею, найімовірніше, — перехід до наступної новини, коли цю дочитали.
- Хедер: News, Ukraine, Longreads у меню; Search і Subscribe; активний пункт — `usePathname` у маленькому клієнтському компоненті + `aria-current='page'`. Футер: соцмережі — окремим списком поза `nav`.
- Сторінки `/news`, `/news/[section]`, `/authors/[login]`, `/longreads`.
- `NEWS_SECTIONS` — одне джерело для навігації Header і Footer та `/news/[section]` (поки там свої масиви); `getArticlePath`.
- `lib/text.ts` — `getInitials(name)`: 2+ слова → перші літери першого й останнього, одне → дві перші літери; зайві пробіли не заважають.
- Дублі між блоками головної — рішення про дизайн; дані для Special Report.
- Доступність і семантика: немає "Skip to content" і утиліти `.sr-only`; без featured-новини на головній немає жодного `h1` (запасний — прихований); у фото статті немає `figcaption` з автором/джерелом фото (потрібні поля на сервері); теги статті — не посилання. TODO на місцях.
- Дрібне: `HOMEPAGE_SUBCATEGORIES` у `page.tsx` досі пише `Exclude<NewsSectionKey, 'ukraine'>` замість `SubcategoryKey`; `SECTION_ICONS` лежить у `article.constants.ts`, тож константи домену залежать від UI-іконок (свідомий вибір, не баг); тіні в `variables.scss` у темній темі стануть світлими (TODO там же).
- `layout.tsx`: розсилка, `metadata`, favicon (`app/icon.svg` зі знаком K, видалити `favicon.ico`), стартові svg у `public/`, перемикач теми.
