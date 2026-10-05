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

// Стаття → ключ її розділу
export function getArticleSection(
  article: ArticleListItem,
): ArticleLabelSection {
  if (article.category === ArticleCategory.LONGREAD) return 'longread';

  if (article.isWarInUkraine) return 'ukraine';

  if (article.subcategory) {
    return article.subcategory.toLowerCase() as Lowercase<ArticleSubcategory>;
  }

  return 'news';
}

type SectionLabelAndLink = {
  // Мітка однієї статті: "Longread"
  label: string;
  // Назва розділу, куди веде мітка: "Longreads". В усіх інших збігається з label
  sectionLabel: string;
  href: string;
};

// Ключ розділу → підписи й адреса. Для крихт сторінок, які знають розділ, але не статтю
export function getSectionLabelAndLink(
  section: ArticleLabelSection,
): SectionLabelAndLink {
  // TODO: сторінки /longreads ще немає (зараз 404), а де житимуть самі лонгріди — /[slug]
  // чи /longreads/[slug] — не вирішено. Від цього залежить href мітки й крихт лонгріда
  if (section === 'longread') {
    return { label: 'Longread', sectionLabel: 'Longreads', href: '/longreads' };
  }

  if (section === 'news') {
    return { label: 'News', sectionLabel: 'News', href: '/news' };
  }

  const { label } = NEWS_SECTIONS[section];

  return { label, sectionLabel: label, href: `/news/${section}` };
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
