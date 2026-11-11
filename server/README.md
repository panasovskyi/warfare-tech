# Warfare Tech API

The REST API behind [warfare-tech.com](https://warfare-tech.com): articles, author profiles and admin login. Built with NestJS 11, Prisma 7 and PostgreSQL.

The project overview is in the [root README](../README.md).

## Stack

- **NestJS 11** on Express
- **Prisma 7** with the `pg` driver adapter, PostgreSQL
- **Zod 4** for request validation
- **JWT** (`@nestjs/jwt`) and **bcrypt** for authentication
- **`@nestjs/throttler`** and **`helmet`** for rate limiting and security headers

## Endpoints

All routes are under the `/api` prefix.

| Method | Route | Access | What it does |
| --- | --- | --- | --- |
| `GET` | `/articles` | public | Paginated list of published articles, newest first, without the body |
| `GET` | `/articles/:slug` | public | One published article with the body |
| `POST` | `/articles` | admin | Create an article |
| `GET` | `/users/:login` | public | Author profile with the ten latest articles |
| `POST` | `/auth/login` | public, 5 requests a minute per IP | Returns an access token |
| `POST` | `/auth/register` | admin | Create a user |

### `GET /articles` query parameters

| Parameter | Values | Default |
| --- | --- | --- |
| `page` | 1–999 | 1 |
| `limit` | 1–40 | 3 |
| `type` | `NEWS` | any |
| `subcategory` | `AIR`, `LAND`, `NAVAL`, `SPACE`, `CYBER`, `UAV` | any |
| `isWarInUkraine` | `true`, `false` | any |
| `isFeatured` | `true`, `false` | any |

The response is `{ items, total, page, limit, totalPages }`.

### Errors

Every error has the same body, shaped for form libraries on the client:

```json
{
  "message": "Validation error",
  "fieldErrors": { "title": ["Title too short: minimum 5 characters"] },
  "formErrors": []
}
```

Built-in NestJS exceptions (an unknown route, malformed JSON) keep their own body: `{ message, error, statusCode }`.

## Rules worth knowing

- **Article rule.** An article has exactly one of two: a `subcategory` or the `isWarInUkraine` flag. The rule lives in the Zod schema, not in the database.
- **Article body.** Markdown limited to what the website renders: paragraphs, http(s) links and images. An image is a paragraph of its own, needs a description and a caption, and must come from an allowed host. Raw HTML is rejected.
- **Image hosts.** `mainPicture` must be an https address on an allowed host. The list is mirrored in the website's `next.config.ts` and in the ingestion schema, and the three have to change together.
- **Slug.** Generated from the title plus a six-character suffix, so two articles with the same title do not collide.
- **Reading time.** Calculated on the server when the article is created (250 words a minute, rounded up).
- **User data.** Public responses select user fields from an allowlist, so the password hash never leaves the database layer.
- **No registration.** There are no reader accounts. The only admin comes from the seed, and the access token lives for 30 days.

## Project structure

```
prisma/
  schema.prisma        data model
  migrations/          SQL migrations
  seed.ts              creates or updates the admin user
src/
  main.ts              bootstrap: helmet, CORS, global prefix, exception filter
  app.module.ts        modules and the rate limit
  article/             controller, service, Zod schemas, query shapes
  auth/                login, register, JWT and role guards, throttler guard
  user/                author profile, user creation
  exceptions/          ApiError, the global filter, Prisma error mapping
  pipes/               ZodValidationPipe
  prisma/              PrismaService
```

## Running locally

You need Node.js 20.9 or newer and a PostgreSQL database.

```bash
npm install
cp .env.example .env
npm run prisma:migrate:deploy
npm run prisma:seed
npm run start:dev
```

`npm install` also generates the Prisma client. The API starts on `http://localhost:5000/api`; try `http://localhost:5000/api/articles`.

### Environment variables

| Variable | What it is |
| --- | --- |
| `PORT` | Port of the API |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Address of the website, the allowed CORS origin |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account created by the seed |
| `TRUST_PROXY` | Optional: how many proxies sit in front of the API (default 1) |

### Scripts

| Script | What it does |
| --- | --- |
| `npm run start:dev` | Start in watch mode |
| `npm run build`, `npm run start:prod` | Build and run the compiled server |
| `npm run prisma:migrate` | Create and apply a migration in development |
| `npm run prisma:migrate:deploy` | Apply existing migrations |
| `npm run prisma:generate` | Regenerate the Prisma client after a schema change |
| `npm run prisma:seed` | Create the admin user or reset its password |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run lint`, `npm run format` | ESLint and Prettier |

There are no automated tests yet.
