import type {
  ArticleAuthor,
  ArticleListItem,
} from '@/features/article/article.types';

export type AuthorProfile = ArticleAuthor & {
  createdAt: string;
  articles: Omit<ArticleListItem, 'author'>[];
};
