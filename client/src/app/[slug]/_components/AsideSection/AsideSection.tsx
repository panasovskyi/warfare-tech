import { SectionIcon } from '@/features/article/components/SectionIcon/SectionIcon';
import styles from './AsideSection.module.scss';
import { ArticleHeadline } from '@/features/article/components/ArticleHeadline/ArticleHeadline';
import { ArrowLink } from '@/components/ui/ArrowLink/ArrowLink';
import {
  getSectionLabelAndLink,
  type ArticleLabelSection,
} from '@/features/article/article.utils';
import {
  ArticleCategory,
  type ArticleListItem,
} from '@/features/article/article.types';
import { NEWS_SECTIONS } from '@/features/article/article.constants';
import { articleApi } from '@/features/article/article.api';

// Скільки статей показуємо. Aside липкий, тож мусить вміщуватися в екран, інакше нижні рядки
// недосяжні, поки колонка тексту не скінчиться. Рядок ≈ 78px: 5 рядків із заголовком і
// "View all" ≈ 500px, вміщується й у ноутбук з вікном ≈ 650px (10 рядків давали ≈ 900px)
const ASIDE_ARTICLES = 5;

type Props = {
  section: ArticleLabelSection;
  articleId: string;
};

export const AsideSection: React.FC<Props> = async ({ section, articleId }) => {
  const { sectionLabel, href } = getSectionLabelAndLink(section);

  const sectionArticlesFilter =
    section === 'longread'
      ? { category: ArticleCategory.LONGREAD }
      : section === 'news'
        ? { category: ArticleCategory.NEWS }
        : NEWS_SECTIONS[section].filter;

  let latestNews: ArticleListItem[] = [];

  try {
    const latestNewsResponse = await articleApi.getArticles({
      ...sectionArticlesFilter,
      // На одну більше, ніж показуємо: поточна стаття часто серед найновіших, і її
      // відкидаємо нижче
      limit: ASIDE_ARTICLES + 1,
    });

    latestNews = latestNewsResponse.items
      .filter((item) => item.id !== articleId)
      .slice(0, ASIDE_ARTICLES);
  } catch (error) {
    console.error(`Article aside request "${section}" failed:`, error);

    return null;
  }

  if (latestNews.length === 0) return null;

  return (
    <aside
      className={styles.aside}
      aria-labelledby='section-latest-title'
      data-section={section}
    >
      <h2 id='section-latest-title' className={styles.aside__title}>
        <SectionIcon section={section} className={styles.aside__icon} />
        Latest in {sectionLabel}
      </h2>

      <ul className={styles.aside__list}>
        {latestNews.map((item) => (
          <li key={item.id} className={styles.aside__item}>
            <ArticleHeadline article={item} />
          </li>
        ))}
      </ul>

      <ArrowLink
        href={href}
        className={styles.aside__link}
        aria-label={`View all in ${sectionLabel}`}
      >
        View all
      </ArrowLink>
    </aside>
  );
};
