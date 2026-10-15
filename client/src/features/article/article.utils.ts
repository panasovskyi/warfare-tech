import {
  NEWS_SECTIONS,
  type NewsSectionKey,
} from '@/features/article/article.constants';
import {
  ArticleType,
  type ArticleListItem,
  type ArticleSubcategory,
} from '@/features/article/article.types';

export type ArticleLabelSection = NewsSectionKey | 'longread' | 'news';

export function getArticleSection(
  article: ArticleListItem,
): ArticleLabelSection {
  if (article.type === ArticleType.LONGREAD) return 'longread';

  if (article.isWarInUkraine) return 'ukraine';

  if (article.subcategory) {
    return article.subcategory.toLowerCase() as Lowercase<ArticleSubcategory>;
  }

  return 'news';
}

type SectionLabelAndLink = {
  label: string;
  sectionLabel: string;
  href: string;
};

export function getSectionLabelAndLink(
  section: ArticleLabelSection,
): SectionLabelAndLink {
  if (section === 'longread') {
    return { label: 'Longread', sectionLabel: 'Longreads', href: '/longreads' };
  }

  if (section === 'news') {
    return { label: 'News', sectionLabel: 'News', href: '/news' };
  }

  const { label } = NEWS_SECTIONS[section];

  return { label, sectionLabel: label, href: `/news/${section}` };
}

export function getAuthorPath(login: string): string {
  return `/authors/${encodeURIComponent(login)}`;
}

export function getSectionTagAndLink(article: ArticleListItem): {
  label: string;
  sectionLabel: string;
  href: string;
  section: ArticleLabelSection;
} {
  const section = getArticleSection(article);

  return { ...getSectionLabelAndLink(section), section };
}
