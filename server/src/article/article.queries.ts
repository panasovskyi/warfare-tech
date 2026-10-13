import { Prisma } from 'generated/prisma/client';

const INCLUDE_PARAMS = {
  author: { select: { fullName: true, login: true } },
} satisfies Prisma.ArticleInclude;

export const articleListItemArgs = {
  include: { ...INCLUDE_PARAMS },
  omit: { body: true },
} satisfies Prisma.ArticleDefaultArgs;

export const articleDetailsArgs = {
  include: { ...INCLUDE_PARAMS },
} satisfies Prisma.ArticleDefaultArgs;
