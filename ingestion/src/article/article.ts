import { getFallbackPictureUrl } from '../cloudinary/fallback';
import { getCloudinaryConfig } from '../config/cloudinary.config';
import type { ModelArticle } from '../rewriting/model-article.schema';
import {
  ArticleType,
  ArticleSubcategory,
  type ArticleDraft,
} from "./article.schema";

const GRAY_PLACEHOLDER = 'https://placehold.co/1200x675.png';

export const getPlaceholderPicture = (): string => {
  try {
    return getFallbackPictureUrl(getCloudinaryConfig().cloudName);
  } catch {
    return GRAY_PLACEHOLDER;
  }
};

export const isPlaceholderPicture = (url: string): boolean =>
  url === getPlaceholderPicture() || url === GRAY_PLACEHOLDER;

const SUBCATEGORIES = Object.values(ArticleSubcategory);

const normalizeTags = (tags: string[]): string[] => [
  ...new Set(
    tags
      .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean),
  ),
];

export const toSubcategory = (value: string | null): ArticleDraft['subcategory'] => {
  const normalized = value?.trim().toUpperCase();

  return SUBCATEGORIES.find((subcategory) => subcategory === normalized) ?? null;
};

export const buildArticle = (
  article: ModelArticle,
  {
    source,
    sourceLink,
    mainPicture = getPlaceholderPicture(),
    photoCredit,
    photoAlt,
  }: {
    source: string;
    sourceLink: string;
    mainPicture?: string;
    photoCredit?: string;
    photoAlt?: string;
  },
): ArticleDraft => ({
  type: ArticleType.NEWS,
  subcategory: toSubcategory(article.subcategory),
  isFeatured: false,
  isWarInUkraine: article.isWarInUkraine,
  mainPicture,
  photoCredit,
  photoAlt,
  title: article.title.trim(),
  description: article.description.trim(),
  body: article.body.trim(),
  tags: normalizeTags(article.tags),
  source,
  sourceLink,
});
