import { Prisma } from 'generated/prisma/client';

// include можна буде винести в константу

// TODO: поле readingTime у стрічці: body сюди не приходить, тож порахувати на фронті не
// вийде. Рахувати при створенні статті й зберігати в базі
export const articleListItemArgs = {
  include: { author: { select: { fullName: true, login: true } } },
  omit: { body: true },
} satisfies Prisma.ArticleDefaultArgs;

export const articleDetailsArgs = {
  include: { author: { select: { fullName: true, login: true } } },
} satisfies Prisma.ArticleDefaultArgs;
