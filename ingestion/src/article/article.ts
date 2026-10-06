import { getFallbackPictureUrl } from '../cloudinary/fallback';
import { getCloudinaryConfig } from '../config/cloudinary.config';
import type { ModelArticle } from '../rewriting/model-article.schema';
import {
  ArticleCategory,
  ArticleSubcategory,
  type ArticleDraft,
} from './article.schema';

// .png on purpose: placehold.co serves SVG by default, which next/image refuses
const GRAY_PLACEHOLDER = 'https://placehold.co/1200x675.png';

// Used when no picture is given or it could not be uploaded: our own branded picture
// in Cloudinary, or the plain gray one when Cloudinary is not configured
export const getPlaceholderPicture = (): string => {
  try {
    return getFallbackPictureUrl(getCloudinaryConfig().cloudName);
  } catch {
    return GRAY_PLACEHOLDER;
  }
};

// Old drafts and the first published article carry the gray one
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

// "Air" or " uav " still count; anything the server does not know becomes null
export const toSubcategory = (value: string | null): ArticleDraft['subcategory'] => {
  const normalized = value?.trim().toUpperCase();

  return SUBCATEGORIES.find((subcategory) => subcategory === normalized) ?? null;
};

// The model decides what the article says; everything else about the record is ours
export const buildArticle = (
  article: ModelArticle,
  {
    source,
    sourceLink,
    mainPicture = getPlaceholderPicture(),
    photoCredit,
  }: {
    source: string;
    sourceLink: string;
    mainPicture?: string;
    photoCredit?: string;
  },
): ArticleDraft => ({
  category: ArticleCategory.NEWS,
  subcategory: toSubcategory(article.subcategory),
  isFeatured: false,
  isWarInUkraine: article.isWarInUkraine,
  mainPicture,
  photoCredit,
  title: article.title.trim(),
  description: article.description.trim(),
  body: article.body.trim(),
  tags: normalizeTags(article.tags),
  source,
  sourceLink,
});
