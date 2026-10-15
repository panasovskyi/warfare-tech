import {
  ArticleDetails,
  ArticleListItem,
  GetArticlesParams,
} from '@/features/article/article.types';
import { api } from '@/lib/api/client';
import { PaginatedResponse } from '@/lib/api/pagination';

const LIST_REVALIDATE_SECONDS = 300;
const ARTICLE_REVALIDATE_SECONDS = 1000;

export const articleApi = {
  async getArticles(
    params?: GetArticlesParams,
  ): Promise<PaginatedResponse<ArticleListItem>> {
    const res = await api.get<PaginatedResponse<ArticleListItem>>('/articles', {
      params,
      next: {
        revalidate: LIST_REVALIDATE_SECONDS,
      },
    });

    return res;
  },

  async getArticleBySlug(slug: string): Promise<ArticleDetails> {
    const res = await api.get<ArticleDetails>(
      `/articles/${encodeURIComponent(slug)}`,
      {
        next: {
          revalidate: ARTICLE_REVALIDATE_SECONDS,
        },
      },
    );

    return res;
  },
};
