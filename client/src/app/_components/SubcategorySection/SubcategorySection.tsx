import Link from 'next/link';
import styles from './SubcategorySection.module.scss';
import { ArticleListItem } from '@/features/article/article.types';
import { ArticleCardCompact } from '@/features/article/components/ArticleCardCompact/ArticleCardCompact';
import { ArticleHeadline } from '@/features/article/components/ArticleHeadline/ArticleHeadline';
import {
  NEWS_SECTIONS,
  SECTION_ICONS,
  SubcategoryKey,
} from '@/features/article/article.constants';

type Props = {
  subcategory: SubcategoryKey;
  articles: ArticleListItem[];
};

export const SubcategorySection: React.FC<Props> = ({
  subcategory,
  articles,
}) => {
  const titleId = `${subcategory}-news-title`;
  const SectionIcon = SECTION_ICONS[subcategory];
  const [featured, ...rest] = articles;

  if (!featured) return null;

  return (
    <section
      className={styles.subcategory}
      aria-labelledby={titleId}
      data-section={subcategory}
    >
      <h2 id={titleId} className={styles.subcategory__title}>
        <Link
          href={`/news/${subcategory}`}
          className={styles.subcategory__link}
        >
          <SectionIcon className={styles.subcategory__icon} />
          {NEWS_SECTIONS[subcategory].label}
        </Link>
      </h2>

      <div className={styles.news}>
        <ArticleCardCompact article={featured} />

        {rest.length > 0 && (
          <ul className={styles.news__list}>
            {rest.map((article) => (
              <li key={article.id} className={styles.news__listItem}>
                <ArticleHeadline article={article} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

