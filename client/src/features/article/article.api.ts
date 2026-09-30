import {
  ArticleDetails,
  ArticleListItem,
  GetArticlesParams,
} from '@/features/article/article.types';
import { api } from '@/lib/api/client';
import { PaginatedResponse } from '@/lib/api/pagination';

export const articleApi = {
  async getArticles(
    params?: GetArticlesParams,
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const res = await api.get<PaginatedResponse<ArticleListItem>>('/articles', {
      params,
    });

    return res;
  },

  async getArticleBySlug(slug: string): Promise<ArticleDetails> {
    const res = await api.get<ArticleDetails>(
      `/articles/${encodeURIComponent(slug)}`,
    );

    return res;
  },
};
