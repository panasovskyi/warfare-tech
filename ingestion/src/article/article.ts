import type { ModelArticle } from '../rewriting/model-article.schema';
import {
  ArticleCategory,
  ArticleSubcategory,
  type ArticleDraft,
} from './article.schema';

// .png on purpose: placehold.co serves SVG by default, which next/image refuses
// TODO: замінити на фото в Cloudinary
export const PLACEHOLDER_PICTURE = 'https://placehold.co/1200x675.png';

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
  { source, sourceLink }: { source: string; sourceLink: string },
): ArticleDraft => ({
  category: ArticleCategory.NEWS,
  subcategory: toSubcategory(article.subcategory),
  isFeatured: false,
  isWarInUkraine: article.isWarInUkraine,
  mainPicture: PLACEHOLDER_PICTURE,
  title: article.title.trim(),
  description: article.description.trim(),
  body: article.body.trim(),
  tags: normalizeTags(article.tags),
  source,
  sourceLink,
});
