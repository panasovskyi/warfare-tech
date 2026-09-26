# SITREP backend: алгоритм побудови (Express → NestJS)

Покроковий опис того, як зібрано бекенд, з акцентом на те, чим Nest відрізняється від Express.
Порядок кроків — той, у якому їх варто повторювати в новому проєкті.

---

## 1. Налаштування сервера (`src/main.ts`)

В Express налаштування сервера — це ланцюжок `app.use(...)` у `server.ts`. У Nest усе робиться в `main.ts` викликами методів на об'єкті застосунку: між `const app = await NestFactory.create(AppModule)` і `app.listen(...)`.

### Загальна схема: Express vs Nest

| Задача | Express | Nest |
|---|---|---|
| CORS | `app.use(cors({ origin, credentials }))` | `app.enableCors({ origin, credentials })` |
| Префікс `/api` | `app.use('/api', router)` | `app.setGlobalPrefix('api')` |
| Обробка помилок | `app.use(errorMiddleware)` після всіх роутів | `app.useGlobalFilters(new ExceptionsFilter())` |
| Розбір JSON | `app.use(express.json())` | нічого — увімкнено за замовчуванням |
| Підключення роутів | `app.use(router)` | нічого — роути збираються з контролерів у модулях |

### CORS — `enableCors`

**Express:** `app.use(cors({ ... }))` на початку ланцюжка, пакет `cors` встановлюється окремо.

**Nest:**
- `app.enableCors({ ... })` приймає **той самий об'єкт опцій**, що й `cors()`. Окремо встановлювати пакет не треба — він уже є в `@nestjs/platform-express`.
- `origin` — адреса фронта, береться з `.env` (`CLIENT_URL`). Масив дозволяє потім додати адресу продакшену.
- `credentials: true` — дозвіл приймати кукі. Це **серверна** опція; `withCredentials` (axios) чи `credentials: 'include'` (fetch) — її **клієнтська** пара, і потрібні обидві. З `credentials: true` `origin` не може бути `'*'`, лише конкретною адресою.
- CORS захищає не сервер, а браузер: сервер відповідає всім, але браузер віддасть відповідь сторінці лише тоді, коли в ній є заголовок `Access-Control-Allow-Origin` з її адресою.

### Префікс `/api` — `setGlobalPrefix`

**Express:** префікс задається при монтуванні роутера — `app.use('/api', router)`.

**Nest:**
- `app.setGlobalPrefix('api')` додає `/api` на початок **усіх** роутів застосунку.
- Контролери про префікс нічого не знають: `@Controller('auth')` + `@Post('login')` → `/api/auth/login`.

### Обробка помилок — `useGlobalFilters`

**Express:** `app.use(errorMiddleware)` — обов'язково останнім, після всіх роутів, бо мідлвари виконуються по черзі.

**Nest:**
- `app.useGlobalFilters(new ExceptionsFilter())` — аналог `errorMiddleware`.
- `ExceptionsFilter` поєднує два джерела помилок: власні `ApiError` і помилки Prisma (через `handlePrismaError`).
- `new` — бо фільтр, зареєстрований так, не проходить через DI.
- Місце виклику відносно роутів не важливе: фільтр — окремий шар, а не ланка ланцюжка.
- Детально про сам фільтр — у розділі 4.

---

## 2. Prisma: схема, сервіс, модуль

1. **Прописуємо `prisma/schema.prisma`** — моделі й enum-и.
2. **Створюємо `PrismaService`** (`src/prisma/prisma.service.ts`):
   - `@Injectable()`, `extends PrismaClient`, адаптер `PrismaPg` з `DATABASE_URL`;
   - lifecycle-хуки Nest: `onModuleInit` → `$connect()`, `onModuleDestroy` → `$disconnect()`.
3. **Створюємо `PrismaModule`** (`src/prisma/prisma.module.ts`):
   - вішаємо `@Global()`;
   - `providers: [PrismaService]` і `exports: [PrismaService]`.
4. **В `AppModule` підключаємо `PrismaModule` в `imports`** — один раз, у корені.

**Різниця з Express:**
- В Express Prisma-клієнт — це синглтон, який експортують з файлу і імпортують руками там, де потрібен (з хаком через `globalThis`, щоб не плодити підключення при hot-reload). У Nest `PrismaService` — провайдер: його отримують через конструктор, а один екземпляр на весь застосунок гарантує DI. Хак з `globalThis` не потрібен.
- `@Global()` означає, що `PrismaService` можна інджектити в будь-якому модулі **без** `imports: [PrismaModule]`. Але:
  - сам модуль усе одно треба **один раз** імпортувати в `AppModule`, інакше Nest про нього не дізнається;
  - `exports` лишається обов'язковим: `@Global()` робить глобальним лише те, що вже експортовано.

---

## 3. Блок User (`src/user/`)

1. **Створюємо `UserService`** з набором методів (`create`, `findByEmail`, `findByLogin`, ...):
   - клас позначаємо **`@Injectable()`**. Без цього декоратора Nest не зможе керувати класом як провайдером і підставляти йому залежності;
   - `PrismaService` отримуємо через конструктор. `PrismaModule` в `UserModule` імпортувати не треба — він `@Global()`.
2. **Створюємо `UserModule`:**
   - `providers: [UserService]` — реєструємо сервіс у модулі;
   - `exports: [UserService]` — віддаємо назовні, бо його використовує інший модуль (`AuthModule`).
3. **Підключення модуля:**
   - зараз `UserModule` імпортує `AuthModule`, і через нього модуль завантажується. Nest піднімає всі модулі, до яких може дійти по дереву `imports` від кореня;
   - коли з'явиться `UserController` (наприклад, для профілю), варто явно додати `UserModule` в `imports` у `AppModule`. Технічно роути запрацюють і без цього, але так модуль не залежатиме від того, чи його імпортує ще хтось.

**Різниця з Express:**
- В Express сервіс імпортують напряму там, де він потрібен. У Nest його реєструють у модулі (`providers`), а використовують через конструктор.
- `imports` приймає **лише модулі**, не сервіси: `imports: [UserModule]`, а не `imports: [UserService]`.
- Один модуль може імпортувати кілька інших, і модуль може бути імпортований кількома, — Nest все одно створює кожен модуль і кожен сервіс **один раз**.

---

## 4. Обробка помилок (`src/exceptions/`)

### Загальна схема: Express vs Nest

| | Express | Nest |
|---|---|---|
| Власна помилка | `ApiError extends Error` | `ApiError extends HttpException` |
| Помилки Prisma | `handlePrismaError` | `handlePrismaError` — без змін |
| Хто їх об'єднує | `errorMiddleware(err, req, res, next)` | `ExceptionsFilter` з `@Catch()` і методом `catch(exception, host)` |
| Де підключається | `server.ts`: `app.use(errorMiddleware)` **після всіх роутів** | `main.ts`: `app.useGlobalFilters(new ExceptionsFilter())` **після** `const app = await NestFactory.create(AppModule)` |
| Доступ до `req`/`res` | параметри функції | `host.switchToHttp().getRequest()` / `.getResponse()` |

### Крок 1. `ApiError` (`api-error.exception.ts`)

**Express:** клас успадковує `Error`, статус — власне поле `statusCode`, коди вписані числами (`400`, `404`).

**Nest:**
- Клас успадковує **`HttpException`** — базовий клас HTTP-помилок у Nest. Тоді Nest-механізми розпізнають `ApiError` як помилку зі статусом, а не як невідомий збій.
- Статус-коди без хардкоду — через enum **`HttpStatus`**: `HttpStatus.NOT_FOUND` замість `404`, `HttpStatus.BAD_REQUEST` замість `400`.
- `super({ message, fieldErrors, formErrors }, statusCode)` — батьківському конструктору передаються **два окремі аргументи**: тіло відповіді (потім його віддає `getResponse()`) і статус (`getStatus()`). Тіло й статус розділені, бо в HTTP це різні речі: JSON у тілі і код у статус-рядку.
- Власний конструктор `ApiError` приймає один об'єкт `{ message, statusCode, ... }`, як і в Express. Всередині він розкладає його на ці два аргументи для `super`.
- Статичні фабрики: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `fieldErrors`, `formErrors`, `validationError`.
- Формат `{ message, fieldErrors, formErrors }` розрахований на react-hook-form:
  - `validationError(zodError)` — порушення схеми (формат даних), всі поля одразу;
  - `fieldErrors({ field, message })` — бізнес-правило, прив'язане до поля ("email зайнятий");
  - `formErrors(message)` — помилка всієї форми ("невірний логін/пароль").

### Крок 2. `handlePrismaError` (`prisma-error.exception.ts`)

**Express і Nest — однаково.** Це звичайна функція, **не клас і не провайдер**: у неї немає стану й залежностей, тож `@Injectable()` не потрібен. Перетворює помилки Prisma (`P2002` — порушення унікальності, `P2025` — запис не знайдено) на `ApiError` або повертає `null`. Змінився лише шлях імпорту клієнта Prisma.

### Крок 3. `ExceptionsFilter` (`exceptions.filter.ts`) — заміна `errorMiddleware`

**Express:** функція з чотирма параметрами `(err, req, res, next)`. Express розпізнає error-мідлвар саме за кількістю параметрів.

**Nest:** клас, що реалізує інтерфейс `ExceptionFilter`.

**Декоратор `@Catch()`**
- Позначає клас як exception filter і вказує, **які типи винятків** він обробляє.
- З аргументами фільтр спрацьовує лише для перелічених класів: `@Catch(HttpException)` — тільки для HTTP-помилок, `@Catch(ApiError, SomeOtherError)` — для кількох.
- **Без аргументів** (`@Catch()`) фільтр ловить **усе**, що кинуто, будь-якого типу. Це прямий аналог `errorMiddleware`, який теж отримує будь-яку помилку. Наш фільтр саме такий.
- Декоратор лише реєструє клас як фільтр і задає, що ловити. Що робити з помилкою, визначає метод `catch`.

**Метод `catch(exception, host)`** — його вимагає інтерфейс `ExceptionFilter`, Nest викликає його для кожного пійманого винятку:
- `exception: unknown` — те, що кинули. Тип `unknown`, бо це може бути `ApiError`, помилка Prisma, звичайний `Error` чи будь-що інше.
- `host: ArgumentsHost` — обгортка над контекстом запиту. Вона **не прив'язана до HTTP**, бо ті самі фільтри в Nest працюють для WebSocket і мікросервісів, де немає `req`/`res`.

**Доступ до `req` і `res`:**
- `host.switchToHttp()` — "я знаю, що це HTTP, дай HTTP-контекст";
- `.getRequest<Request>()` / `.getResponse<Response>()` — ті самі об'єкти Express, що й у мідлварі. Далі `res.status(...).json(...)` — як завжди.

**Логіка всередині** — та сама послідовність, що в `errorMiddleware`:
1. `exception instanceof ApiError` → віддати як є: `res.status(error.getStatus()).json(error.getResponse())`;
2. інакше `handlePrismaError(exception)` → якщо повернув `ApiError`, віддати його;
3. інакше `console.error(...)` і `500 Internal Server Error`.

**`next` немає:** фільтр — кінцева точка обробки, передавати керування далі нікуди.

### Крок 4. Підключення в `main.ts`

**Express:** `app.use(errorMiddleware)` у `server.ts` — обов'язково **останнім**, після всіх роутів, бо Express виконує мідлвари по черзі.

**Nest:** у `main.ts`, після `const app = await NestFactory.create(AppModule)`:
- `app.useGlobalFilters(new ExceptionsFilter())`.
- **`new`** потрібен, бо глобальний фільтр, зареєстрований так, не проходить через DI-контейнер: екземпляр створюємо самі. З тієї ж причини фільтру не потрібен `@Injectable()`.
- Місце виклику відносно роутів не важливе. Фільтр — окремий шар, а не ланка в ланцюжку, і Nest викликає його сам, коли десь кинуто виняток.

### Що ще змінилося

- `try/catch` у сервісах і контролерах не потрібен: Nest сам ловить і синхронні `throw`, і відхилені проміси з `async`-методів. В Express 5 це теж працює, в Express 4 знадобився б `catchAsync`.

---

## 5. Блок Auth (`src/auth/`) — реєстрація і логін

> Частина auth, яка потрібна лише для захищених роутів (перевірка токена, `req.user`, поточний юзер), буде описана разом із блоком статей.

### Загальна схема: Express vs Nest

| | Express | Nest |
|---|---|---|
| Роутер | окремий `router` + `app.use(router)` | контролер: `@Controller('auth')` + `@Post('login')` |
| Валідація | `validationMiddleware` перед контролером у роутері | `ZodValidationPipe` в `@Body(...)` параметра методу |
| Результат валідації | `req.body = data` | `transform` повертає `data`, і воно стає аргументом методу |
| Відповідь | `res.status(...).json(...)` | `return` значення |
| Токени | власна утиліта з `jsonwebtoken` | `JwtModule.register(...)` + `JwtService` через конструктор |

### Крок 1. Zod-схеми (`schemas/registration.schema.ts`, `schemas/login.schema.ts`)

**Express і Nest — однаково:** Zod не залежить від фреймворку, схеми й `z.infer` ті самі.
- `registrationSchema`: `.refine()` звіряє паролі, `.transform()` вирізає `passwordConfirmation`. Тому далі в код приходить уже "чистий" об'єкт без підтвердження пароля.
- `z.infer` — це тип **результату** (після `.transform()`).

### Крок 2. `ZodValidationPipe` (`src/pipes/zod-validation.pipe.ts`) — заміна `validationMiddleware`

**Express:** мідлвар приймає `{ schema, source }`, робить `safeParse` і записує результат назад у `req.body` (або в `req.validatedQuery` / `req.validatedParams`, бо `query` і `params` не можна перезаписати). Стоїть у роутері перед контролером.

**Nest:**
- Клас реалізує інтерфейс `PipeTransform` з методом `transform(value)`.
- `transform` робить `safeParse`. При помилці кидає `ApiError.validationError(...)`, як і мідлвар. При успіху **одразу повертає `data`**, а Nest підставляє це значення в параметр методу контролера. Записувати щось у `req` не потрібно.
- Підключається не в ланцюжку перед контролером, а **як аргумент декоратора параметра**: `@Body(new ZodValidationPipe(schema))`.
- Перемикач `source` не потрібен: джерело визначає декоратор — `@Body()`, `@Query()` чи `@Param()`.
- Без `@Injectable()`: пайп створюється через `new`, а не через DI.
- Лежить окремо в `src/pipes/`, бо це загальний інструмент, не прив'язаний до auth.

### Крок 3. `AuthService` (`auth.service.ts`)

**Логіка — як в Express.** Різниця лише в тому, як сервіс отримує залежності:
- `@Injectable()`;
- `UserService` і `JwtService` приходять через конструктор, а не імпортом.

Методи:
- `register(payload)` → `userService.create(payload)`;
- `login({ identifier, password })` → знайти юзера → звірити пароль (`bcrypt.compare`) → `jwtService.sign({ id, role })` → повернути `{ accessToken, user }`.

Сервіс повертає юзера **разом із паролем**. Прибирається пароль у контролері.

### Крок 4. `AuthController` (`auth.controller.ts`)

**Express:** роутер і контролер — окремі речі. У роутері прописуються шлях і мідлвари, у контролері — хендлер з `req`, `res`.

**Nest:** контролер поєднує обидві ролі.
- `@Controller('auth')` — спільний префікс шляху.
- `@Post('register')`, `@Post('login')` — конкретні роути. Разом із префіксом і глобальним `api` виходить `/api/auth/register`.
- `app.use(router)` немає: роути з'являються самі, коли контролер зареєстрований у `controllers` модуля.
- Тіло запиту — через `@Body(new ZodValidationPipe(schema)) payload: Type`.
- **`return` замість `res.status().json()`**: Nest сам серіалізує повернене значення в JSON.
  - `@Post` за замовчуванням віддає 201. Для логіну, який нічого не створює, стоїть `@HttpCode(HttpStatus.OK)`.
- Перед `return` юзер проходить через `toSafeUser(...)` — це межа з клієнтом, тут прибирається пароль.

### Крок 5. `AuthModule` (`auth.module.ts`)

- `controllers: [AuthController]`, `providers: [AuthService]`.
- `imports`:
  - `UserModule` — щоб `AuthService` міг отримати `UserService`;
  - `JwtModule.register({ secret, signOptions: { expiresIn } })` — секрет і термін дії налаштовуються **один раз**, а `JwtService` потрібен у сервісі, щоб створити токен при логіні.
- `exports: [AuthService]` потрібен лише тоді, коли `AuthService` використовує інший модуль (зараз — ніхто). `exports` для `JwtModule` належить до частини для статей.

---

## 6. Блок Article (`src/article/`) — створення статті

### Загальна схема: Express vs Nest

В Express створення статті — це роут із трьома мідлварами перед контролером. У Nest кожен мідлвар замінюється своїм механізмом:

| Задача | Express | Nest |
|---|---|---|
| Авторизація | `authMiddleware`: розбирає заголовок, `req.user = data` | `JwtGuard` + `@UseGuards` |
| Юзер у контролері | `req.user.id` (контролер отримує `req`) | декоратор `@CurrentUser()` у параметрі методу |
| Перевірка ролі | `roleMiddleware(ADMIN)` — роль передається аргументом | `RolesGuard` + декоратор `@Roles([UserRole.ADMIN])` |
| Валідація | `validationMiddleware({ schema, source: 'body' })` | `@Body(new ZodValidationPipe(schema))` |
| Порядок | задаєш сам у роутері | guard-и — в порядку списку `@UseGuards`, пайпи — завжди після guard-ів |

### Крок 1. Сервіс і контролер

- **`ArticleService`** — `@Injectable()`, `PrismaService` через конструктор. `create(payload, authorId)`:
  - `authorId` — окремий аргумент, бо це довірене значення з токена, а не дані від клієнта;
  - `slug` генерується з `title` (`slugify` + 6 випадкових hex-символів), клієнт його не надсилає.
- **`ArticleController`** — `@Controller('articles')`, `ArticleService` через конструктор, `@Post()` без підшляху → `POST /api/articles`.

### Крок 2. Авторизація — `JwtGuard` (`src/auth/guards/jwt-auth.guard.ts`)

**Express:** `authMiddleware` стоїть у роутері першим.

**Nest:**
- `@Injectable()`, `implements CanActivate`, метод `canActivate(context)`.
- Робить те саме, що мідлвар: `context.switchToHttp().getRequest()` → заголовок `authorization` → розбір `Bearer <token>` → `jwtService.verify<TokenPayload>(token)` → `req.user = data` → `return true`.
- При помилці — `throw ApiError.unauthorized(...)`, а не `return false`: `false` дав би стандартну 403 Nest замість нашого формату.
- Підключається над методом: `@UseGuards(JwtGuard)`.
- **DI:** guard створюється в модулі **контролера** (`ArticleModule`), тож там має бути доступний `JwtService`. Тому `AuthModule` експортує `JwtModule`, а `ArticleModule` імпортує `AuthModule`.
- **Тип `req.user`** — так само, як в Express: `src/types/express.d.ts` з `declare global` → `namespace Express` → `interface Request { user?: TokenPayload }`.

### Крок 3. Юзер у контролері — `@CurrentUser()` (`src/auth/decorators/current-user.decorator.ts`)

**Express:** контролер отримує `req` і просто читає `req.user.id`.

**Nest:** контролер `req` не отримує, тож `req.user`, записаний guard-ом, йому недоступний напряму. `@CurrentUser()` — міст між guard-ом і контролером:
- створюється через `createParamDecorator` — це **декоратор параметра**, він виконується на кожен запит;
- дістає `req.user` і повертає його в параметр методу; `@CurrentUser('id')` повертає одне поле;
- **нічого не перевіряє** — лише доставляє те, що вже перевірив `JwtGuard`;
- якщо `req.user` немає, це помилка в коді (декоратор без guard-а), тому кидається звичайний `Error` → 500 з логом;
- використання: `@CurrentUser('id') authorId: string` поруч із `@Body(...)`.

### Крок 4. Перевірка ролі — `RolesGuard` + `@Roles`

**Express:** `roleMiddleware(ADMIN)` — роль передається аргументом у мідлвар.

**Nest:** guard аргументів не приймає — його створює сам Nest через DI. Тому роль розбивається на дві частини:

**Декоратор `@Roles` (`src/auth/decorators/roles.decorator.ts`):**
- `Reflector.createDecorator<UserRole[]>()` — один рядок;
- це **декоратор методу**, без логіки: він лише навішує на метод мітку зі списком ролей;
- приймає один аргумент, тож ролі передаються масивом: `@Roles([UserRole.ADMIN])`;
- ставиться поруч із `@UseGuards` і `@Post` — порядок цих декораторів між собою не важливий.

**`RolesGuard` (`src/auth/guards/roles.guard.ts`):**
- `@Injectable()` обов'язковий: без нього TypeScript не збереже типи параметрів конструктора, Nest не підставить `Reflector`, і guard впаде вже на запиті (на старті помилки не буде);
- у конструктор приходить `Reflector` — він доступний у будь-якому модулі, тож імпорти й експорти модулів міняти не треба;
- `reflector.getAllAndOverride(Roles, [context.getHandler(), context.getClass()])` — читає мітку з методу, а якщо її немає — з контролера;
- мітки немає → `return true`: роут не обмежений за роллю (але `JwtGuard` однаково вимагає логін). Забутий `@Roles` = роут відкритий для всіх залогінених;
- далі — логіка як в Express: юзер з `context.switchToHttp().getRequest()`, роль не в списку → `ApiError.forbidden()` (403, а не 401: юзер відомий, але прав не має).

**Підключення:** `@UseGuards(JwtGuard, RolesGuard)` — **порядок важливий**, бо `RolesGuard` читає `req.user`, який кладе `JwtGuard`.

### Крок 5. Валідація

Так само, як у логіні й реєстрації: `@Body(new ZodValidationPipe(createArticleSchema)) payload: CreateArticlePayload`. У схемі немає `authorId` (береться з токена) і `slug` (генерується в сервісі).

### Крок 6. `ArticleModule`

- `imports: [AuthModule]` — щоб отримати `JwtService` для `JwtGuard`;
- `controllers: [ArticleController]`, `providers: [ArticleService]`;
- `ArticleModule` імпортується в `AppModule`.

### Разом: що відбувається з запитом `POST /api/articles`

1. `JwtGuard` — немає токена чи він невалідний → **401**; інакше `req.user = { id, role }`.
2. `RolesGuard` — роль не `ADMIN` → **403**.
3. `ZodValidationPipe` — тіло не відповідає схемі → **400** з `fieldErrors`.
4. `@CurrentUser('id')` — дістає `id` з `req.user`.
5. `articleService.create(payload, authorId)` → **201** зі статтею.

---

## 7. Отримання статей — стрічка (`GET /api/articles`)

### Загальна схема: Express vs Nest

| Задача | Express | Nest |
|---|---|---|
| Валідація query | `validationMiddleware({ schema, source: 'query' })` → `req.validatedQuery` | `@Query(new ZodValidationPipe(schema))` — той самий пайп, що й для `@Body` |
| Результат валідації | окрема властивість `req.validatedQuery` (бо `req.query` не можна перезаписати) | одразу аргумент методу |
| Пагінація | `findMany` + `count` | те саме, паралельно через `Promise.all` (або `$transaction`) |

### Крок 1. Схема query (`schemas/get-articles.schema.ts`)

Усі query-параметри приходять **рядками**, тож схема їх ще й перетворює:
- `page`, `limit` — `z.coerce.number()` + `int`, `positive`, `max` і `default` (`page: 1`, `limit: 3`);
- `category`, `subcategory` — `z.enum(...)` з enum-ів Prisma, `.optional()`: без них — уся стрічка;
- `isWarInUkraine`, `isFeatured` — **`z.stringbool()`**, а не `z.coerce.boolean()`. `coerce.boolean` перетворює будь-який непорожній рядок на `true`, тож `"false"` став би `true`. `stringbool` правильно розуміє `true`/`false` (а також `1`/`0`, `yes`/`no`).

### Крок 2. Контролер — `@Query` замість `req.validatedQuery`

**Express:** мідлвар отримує `source: 'query'`, валідує `req.query` і, оскільки `req.query` не можна перезаписати, кладе результат у `req.validatedQuery`.

**Nest:**
- `@Get()` без guard-ів — читати стрічку може будь-хто.
- `@Query(new ZodValidationPipe(getArticlesSchema)) params: GetArticlesQuery`.
- **Пайп той самий, що й для `@Body`:** йому байдуже, звідки дані. Джерело визначає декоратор (`@Body()` — тіло, `@Query()` — query-рядок), а пайп лише валідує отримане значення. Тому перемикач `source` більше не потрібен.
- `@Query()` без аргументу віддає весь об'єкт query, `@Query('page')` — одне поле.
- Пайп повертає **результат парсингу**: у методі `page` уже число, `isWarInUkraine` — булеве значення, а відсутні параметри замінені дефолтами. `req.validatedQuery` не потрібен — значення одразу стає аргументом методу.

### Крок 3. Сервіс — фільтри і пагінація

**Фільтри → `where`:**
- `const { page, limit, ...query } = params` — пагінацію відокремлюємо, решта — готові фільтри, бо назви query-параметрів збігаються з полями моделі.
- `where = { ...query, status: ArticleStatus.PUBLISHED }`:
  - Prisma **ігнорує `undefined`** у `where`: не переданий фільтр означає "без фільтра". (`null`, навпаки, означає `IS NULL`.)
  - `status` задається сервером явно і стоїть **після** `...query`, щоб ніщо з query не могло його перезаписати. Клієнт не вирішує, чи бачити чернетки.

**Запит:**
- `orderBy: { createdAt: 'desc' }` — обов'язково. Без явного сортування Postgres не гарантує порядку, і з пагінацією статті "стрибають" між сторінками.
- `skip: (page - 1) * limit`, `take: limit`.
- Порядок ключів в об'єкті запиту не важливий: Prisma будує SQL у фіксованому порядку (`WHERE` → `ORDER BY` → `OFFSET`/`LIMIT`). Важливий він лише при розгортанні через `...`: за однакових ключів виграє той, що стоїть пізніше.

**Пагінація — `findMany` + `count` з однаковим `where`:**
- `Promise.all([findMany(...), count({ where })])` — обидва запити виконуються **паралельно**.
- Альтернатива — `this.prisma.$transaction([...])`:
  - `$transaction` викликається на клієнті, а не на моделі;
  - запити в масиві пишуться **без `await`**: Prisma-запит не виконується в момент виклику, `$transaction` запускає їх сам;
  - виконує запити **по черзі** в одній транзакції, тобто повільніше за `Promise.all`;
  - головна перевага транзакції — атомарність ("або все, або нічого") — важлива для **записів** (класичний приклад — переказ грошей). Для двох читань відкочувати нічого, а узгодженість знімків за стандартного рівня ізоляції Postgres (Read Committed) повністю не гарантується. Тому для стрічки обрано `Promise.all`.

**Відповідь:** `{ items, total, page, limit, totalPages: Math.ceil(total / limit) }`.

### Крок 4. Форма даних і типи — одне джерело для запиту й типу

- **`src/types/pagination.ts`** — `PaginatedResponse<T>` з `items: T[]`. Generic і спільний, бо однаково підходить для будь-якого списку, не лише статей.
- **`src/article/article.queries.ts`** — аргументи запиту в константах:
  - `articleListItemArgs`: автор лише з `fullName` і `login` (через `select`, а не весь `include: { author: true }`, який віддав би хеш пароля), `omit: { body: true }` — у стрічці текст статті не потрібен;
  - `articleDetailsArgs` — для сторінки однієї статті (з `body`);
  - `satisfies Prisma.ArticleDefaultArgs` — TypeScript перевіряє, що це валідні аргументи Prisma, але зберігає точний тип об'єкта.
- **`src/article/article.types.ts`** — типи, виведені з цих констант: `ArticleListItem` і `ArticleDetails` через `Prisma.ArticleGetPayload<typeof ...>`.
- У сервісі аргументи розгортаються в запит (`...articleListItemArgs`). Запит і тип мають одне джерело: зміниш константу — зміниться і те, що повертає база, і тип. Ручний тип на кшталт `Omit<Article, 'body'> & { author: ... }` міг би непомітно розійтися із запитом.
- Тип повернення: `Promise<PaginatedResponse<ArticleListItem>>` — і в сервісі, і в контролері.

---

## 8. Отримання статті за slug (`GET /api/articles/:slug`)

### Загальна схема: Express vs Nest

| Задача | Express | Nest |
|---|---|---|
| Роут з параметром | `router.get('/:slug', ...)` | `@Get(':slug')` над методом |
| Доступ до параметра | `req.params.slug` | `@Param()` — весь об'єкт, `@Param('slug')` — одне поле |
| Валідація | `validationMiddleware({ schema, source: 'params' })` → `req.validatedParams` | `@Param(new ZodValidationPipe(schema))` — той самий пайп |
| Статті немає | `throw ApiError.notFound(...)` | те саме, в контролері |

### Крок 1. Роут з динамічним параметром

- Синтаксис той самий, що в Express: назва параметра після двокрапки. Але пишеться він у дужках **декоратора методу** — `@Get(':slug')`, а не в `@Controller(...)`. Разом із префіксами виходить `/api/articles/:slug`.
- Роут публічний, без guard-ів.
- **Порядок роутів важливий.** Якщо колись з'явиться статичний шлях на кшталт `@Get('featured')`, його треба оголосити **вище** `@Get(':slug')`. Інакше `:slug` перехопить слово `featured` як slug, і запит отримає 404.

### Крок 2. Валідація — `@Param`

**Express:** мідлвар з `source: 'params'`; як і з query, результат доводиться складати в окрему властивість `req.validatedParams`.

**Nest:**
- `@Param(new ZodValidationPipe(getArticleDetailsSchema)) { slug }: GetArticleDetailsParam` — той самий пайп, що для `@Body` і `@Query`, змінюється лише декоратор.
- `@Param()` без аргументу віддає об'єкт усіх параметрів маршруту (`{ slug }`), тож його можна одразу деструктуризувати в сигнатурі.
- Схема (`schemas/get-article-details.schema.ts`) перевіряє **формат** slug — та сама регулярка, за якою генерує `slugify`: лише малі літери, цифри й дефіси, плюс максимальна довжина. Перевірка на кшталт `.min(1)` була б марною: порожній slug (`/api/articles/`) потрапляє не сюди, а в `@Get()`.
- Два різні результати:
  - **400** — такий slug не може існувати в принципі (`Bad_Slug!`, `<script>`), до бази запит не доходить;
  - **404** — формат правильний, але статті немає.

### Крок 3. Сервіс і "не знайдено"

- `getBySlug(slug)`: `findUnique` з `...articleDetailsArgs` (з `body` і автором лише з `fullName`/`login`) і `where: { slug, status: ArticleStatus.PUBLISHED }`. У Prisma 7 `findUnique` дозволяє додавати до унікального поля звичайні фільтри, тож чернетку за slug не відкрити.
- Сервіс повертає `ArticleDetails | null` — те саме правило, що в `UserService`: сервіс шукає, а що означає "не знайдено", вирішує той, хто викликає.
- Контролер: якщо `null` — `throw ApiError.notFound('Article not found')`. Без цього `null` пішов би клієнту з кодом 200, і фронт отримав би "успішну" порожню відповідь.
- Тип повернення контролера — `Promise<ArticleDetails>`, без `| null`: після перевірки TypeScript уже знає, що там стаття.
