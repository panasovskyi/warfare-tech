import type {
  ArticleAuthor,
  ArticleListItem,
} from '@/features/article/article.types';

// Профіль автора, як його віддає GET /users/:login. Статті приходять без поля author (автор —
// власник профілю): до 10 останніх опублікованих, без body
export type AuthorProfile = ArticleAuthor & {
  createdAt: string;
  articles: Omit<ArticleListItem, 'author'>[];
};
