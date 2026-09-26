import { ArticleStatus, Prisma } from 'generated/prisma/client';

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
