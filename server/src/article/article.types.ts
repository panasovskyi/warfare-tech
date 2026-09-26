import { Prisma } from 'generated/prisma/client';
import {
  articleDetailsArgs,
  articleListItemArgs,
} from 'src/article/article.queries';

export type ArticleListItem = Prisma.ArticleGetPayload<
  typeof articleListItemArgs
>;

export type ArticleDetails = Prisma.ArticleGetPayload<
  typeof articleDetailsArgs
>;
