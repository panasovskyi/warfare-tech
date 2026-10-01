import {
  NEWS_SECTIONS,
  type NewsSectionKey,
} from '@/features/article/article.constants';
import {
  ArticleCategory,
  type ArticleListItem,
  type ArticleSubcategory,
} from '@/features/article/article.types';

// Ключ, за яким стилі беруть колір мітки (data-атрибут у розмітці)
export type ArticleLabelSection = NewsSectionKey | 'longread' | 'news';

export function getSectionTagAndLink(article: ArticleListItem): {
  label: string;
  href: string;
  section: ArticleLabelSection;
} {
  if (article.category === ArticleCategory.LONGREAD) {
    return { label: 'Longread', href: '/longreads', section: 'longread' };
  }

  if (article.isWarInUkraine) {
    return {
      label: NEWS_SECTIONS.ukraine.label,
      href: '/news/ukraine',
      section: 'ukraine',
    };
  }

  if (article.subcategory) {
    const key =
      article.subcategory.toLowerCase() as Lowercase<ArticleSubcategory>;

    return {
      label: NEWS_SECTIONS[key].label,
      href: `/news/${key}`,
      section: key,
    };
  }

  return { label: 'News', href: '/news', section: 'news' };
}
