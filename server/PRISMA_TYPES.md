# Prisma: типи для запитів із `select` / `omit` / `include`

## Проблема

Згенерований тип моделі (`User`, `Article`) описує **повний** рядок таблиці. Але запит часто повертає іншу форму:

- `select` — лише перелічені поля;
- `omit` — усе, крім перелічених;
- `include` — усе плюс зв'язки (`author`, `articles`).

Тип `User` для такого результату вже неправильний. Писати тип вручну (`Omit<Article, 'body'> & { author: { ... } }`) погано: змінив запит — тип мовчки розійшовся з реальністю, і TypeScript цього не помітить.

## Рішення в три кроки

### 1. Винести аргументи запиту в константу з `satisfies`

```ts
// src/article/article.queries.ts
import { Prisma } from 'generated/prisma/client';

export const articleListItemArgs = {
  include: { author: { select: { fullName: true, login: true } } },
  omit: { body: true },
} satisfies Prisma.ArticleDefaultArgs;
```

- `Prisma.<Модель>DefaultArgs` — тип для "форми" запиту: `select` / `include` / `omit`.
- `satisfies` перевіряє, що об'єкт — валідні аргументи Prisma, і водночас **зберігає точний тип** константи: TypeScript пам'ятає, що вибрані саме `fullName` і `login`.

### 2. Розгорнути константу в запиті замість того, щоб писати `select` / `omit` вручну

```ts
// src/article/article.service.ts
this.prisma.article.findMany({
  ...articleListItemArgs,
  where,
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: (page - 1) * limit,
});
```

`where`, `orderBy`, `take`, `skip` лишаються в самому запиті. У константу виносимо лише **форму результату**.

### 3. Вивести тип з тієї самої константи

```ts
// src/article/article.types.ts
import { Prisma } from 'generated/prisma/client';
import { articleListItemArgs } from 'src/article/article.queries';

export type ArticleListItem = Prisma.ArticleGetPayload<typeof articleListItemArgs>;
```

- `Prisma.<Модель>GetPayload<...>` приймає аргументи запиту і повертає точний тип результату.
- Запит і тип тепер мають **одне джерело**: змінив константу — змінилося і те, що повертає база, і тип.

## Приклад із `select`: публічний профіль

```ts
// src/user/user.queries.ts
export const userProfileArgs = {
  select: {
    login: true,
    fullName: true,
    createdAt: true,
    articles: {
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
      omit: { body: true },
      take: 10,
    },
  },
} satisfies Prisma.UserDefaultArgs;

// src/user/user.types.ts
export type UserProfile = Prisma.UserGetPayload<typeof userProfileArgs>;
```

Зв'язок (`articles`) при `select` пишеться **всередині** `select` як звичайне поле, зі своїми `where` / `orderBy` / `omit` / `take`.

## Важливі нюанси

**`satisfies`, а не анотація типу.**
`const args: Prisma.UserDefaultArgs = { ... }` "розмиває" тип: константа стає просто "якимись аргументами", і `UserGetPayload` вже не знає, які поля вибрані. У результаті TypeScript дозволить звернутися до `email`, хоча його не вибирали. `satisfies` перевіряє те саме, але точний тип зберігає.

**Що з чим можна поєднувати на одному рівні:**

| Поєднання | Можна? |
|---|---|
| `include` + `omit` | ✅ |
| `select` + `include` | ❌ помилка типів |
| `select` + `omit` | ❌ помилка типів |

Якщо потрібен `select`, зв'язки переносяться всередину нього (див. приклад профілю).

**`select` (білий список) надійніший за `omit` (чорний список) для публічних даних.**
- `select` віддає лише те, що явно перелічено.
- `omit` віддає все, крім переліченого. Якщо в модель колись додати нове чутливе поле (скажімо, хеш refresh-токена), воно автоматично потрапить у відповідь, поки хтось не згадає додати його в `omit`.

**Зв'язок з юзером — завжди через `select`.**
`include: { author: true }` поверне **весь** запис юзера разом із хешем пароля. Автора треба вибирати явно: `author: { select: { fullName: true, login: true } }`.

**Порядок при розгортанні.**
Для Prisma порядок ключів в об'єкті запиту не важливий. Але при `...` за однакових ключів виграє той, що стоїть пізніше. Тому в константу не варто класти `where` чи `orderBy`: їх легко випадково перекрити.

## Де що лежить

| Файл | Що в ньому |
|---|---|
| `<модуль>.queries.ts` | константи з аргументами запитів (`...Args`) — це значення, вони виконуються під час роботи |
| `<модуль>.types.ts` | типи, виведені з констант (`...GetPayload`) — лише типи |

## Коли все це не потрібно

Якщо запит повертає модель **цілком**, без `select` / `omit` / `include`, достатньо готового типу з клієнта: `import { User } from 'generated/prisma/client'`.
