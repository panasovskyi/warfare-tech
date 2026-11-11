import { getFallbackPictureUrl } from '../cloudinary/fallback';
import { getCloudinaryConfig } from '../config/cloudinary.config';
import type { ModelArticle } from '../rewriting/model-article.schema';
import {
  ArticleType,
  ArticleSubcategory,
  type ArticleDraft,
} from "./article.schema";

// Саме .png: placehold.co за замовчуванням віддає SVG, а next/image його не приймає
const GRAY_PLACEHOLDER = 'https://placehold.co/1200x675.png';

// Використовується, коли фото не дано або його не вдалось завантажити: наша фірмова
// картинка в Cloudinary, а якщо Cloudinary не налаштовано, — проста сіра
export const getPlaceholderPicture = (): string => {
  try {
    return getFallbackPictureUrl(getCloudinaryConfig().cloudName);
  } catch {
    return GRAY_PLACEHOLDER;
  }
};

// Старі чернетки й перша опублікована стаття мають сіру заглушку
export const isPlaceholderPicture = (url: string): boolean =>
  url === getPlaceholderPicture() || url === GRAY_PLACEHOLDER;

// Усі підкатегорії, які знає сервер
const SUBCATEGORIES = Object.values(ArticleSubcategory);

// Теги: нижній регістр, дефіси замість пробілів, без порожніх і повторів
const normalizeTags = (tags: string[]): string[] => [
  ...new Set(
    tags
      .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean),
  ),
];

// «Air» чи « uav » теж підходять; усе, чого сервер не знає, стає null
export const toSubcategory = (value: string | null): ArticleDraft['subcategory'] => {
  const normalized = value?.trim().toUpperCase();

  return SUBCATEGORIES.find((subcategory) => subcategory === normalized) ?? null;
};

// Що написано в статті, вирішує модель; усе інше в записі — наше
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
