import Link from 'next/link';
import styles from './SubcategorySection.module.scss';
import { ArticleListItem } from '@/features/article/article.types';
import { ArticleCardCompact } from '@/features/article/components/ArticleCardCompact/ArticleCardCompact';
import { ArticleHeadline } from '@/features/article/components/ArticleHeadline/ArticleHeadline';

type Props = {
  // TODO: зараз сюди пройде будь-який рядок — замінити на тип ключа розділу з мапи розділів
  subcategory: string;
  articles: ArticleListItem[];
};

export const SubcategorySection: React.FC<Props> = ({
  subcategory,
  articles,
}) => {
  // Блок стоїть на сторінці шість разів, тож id заголовка будується з підкатегорії
  const titleId = `${subcategory}-news-title`;
  const [featured, ...rest] = articles;

  if (!featured) return null;

  return (
    <section className={styles.subcategory} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.subcategory__title}>
        {/*
          Залупмо тут іконку типу літак, ракета тощо
          в залежності від підкатегоріх щось підходяще
          TODO: іконка декоративна — svg з aria-hidden, скрінрідер читає лише назву
        */}
        <Link
          href={`/news/${subcategory}`}
          className={styles.subcategory__link}
        >
          {/* TODO: видимий підпис ("Air") брати з мапи розділів, а не сирий subcategory */}
          {subcategory}
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
