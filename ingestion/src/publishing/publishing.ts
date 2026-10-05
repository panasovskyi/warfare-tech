import axios from 'axios';
import { ArticleStatus, type ArticleDraft } from '../article/article.schema';
import type { PublishingConfig } from '../config/publishing.config';
import { PublishingError, toPublishingError } from './errors';

const TIMEOUT_MS = 15_000;

export type PublishedArticle = {
  id: string;
  slug: string;
};

// Only the fields the server's create schema knows. A missing subcategory is left
// out, not sent as null; the status is decided here: the manual review already happened.
export const toPayload = (article: ArticleDraft) => ({
  category: article.category,
  subcategory: article.subcategory ?? undefined,
  status: ArticleStatus.PUBLISHED,
  isFeatured: article.isFeatured,
  isWarInUkraine: article.isWarInUkraine,
  mainPicture: article.mainPicture,
  title: article.title,
  description: article.description,
  body: article.body,
  tags: article.tags,
  source: article.source,
  sourceLink: article.sourceLink,
});

export const publishArticle = async (
  { apiBaseUrl }: PublishingConfig,
  token: string,
  article: ArticleDraft,
): Promise<PublishedArticle> => {
  try {
    const response = await axios.post<Partial<PublishedArticle>>(
      `${apiBaseUrl}/articles`,
      toPayload(article),
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: TIMEOUT_MS,
      },
    );

    const { id, slug } = response.data;

    if (!id || !slug) {
      throw new PublishingError(
        'Publishing failed: the server did not return the new article',
      );
    }

    return { id, slug };
  } catch (error) {
    throw error instanceof PublishingError
      ? error
      : toPublishingError(error, 'Publishing');
  }
};
