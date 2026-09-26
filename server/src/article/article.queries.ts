import { Prisma } from 'generated/prisma/client';

// include можна буде винести в константу

export const articleListItemArgs = {
  include: { author: { select: { fullName: true, login: true } } },
  omit: { body: true },
} satisfies Prisma.ArticleDefaultArgs;

export const articleDetailsArgs = {
  include: { author: { select: { fullName: true, login: true } } },
} satisfies Prisma.ArticleDefaultArgs;
