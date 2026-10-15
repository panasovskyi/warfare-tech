import {
  NEWS_SECTIONS,
  type NewsSectionKey,
} from '@/features/article/article.constants';
import {
  ArticleCategory,
  type ArticleListItem,
  type ArticleSubcategory,
} from '@/features/article/article.types';

export type ArticleLabelSection = NewsSectionKey | 'longread' | 'news';

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
  if (section === 'longread') {
    return { label: 'Longread', sectionLabel: 'Longreads', href: '/longreads' };
  }

  if (section === 'news') {
    return { label: 'News', sectionLabel: 'News', href: '/news' };
  }

  const { label } = NEWS_SECTIONS[section];

  return { label, sectionLabel: label, href: `/news/${section}` };
}

// Адреса сторінки автора. login на сервері — будь-які символи (3–20), тож його кодуємо, як
// slug в api: "/", "?" чи "#" у логіні інакше зламали б адресу. Єдине місце, де вона будується
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
