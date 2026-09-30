import Link from 'next/link';
import styles from './LatestSection.module.scss';
import { ArticleCardHorizontal } from '@/features/article/components/ArticleCardHorizontal/ArticleCardHorizontal';
import { ArticleListItem } from '@/features/article/article.types';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';

type Props = {
  articles: ArticleListItem[];
};

export const LatestSection: React.FC<Props> = ({ articles }) => {
  return (
    <section className={styles.latest} aria-labelledby='latest-news-title'>
      <div className={styles.latest__topWrapper}>
        <h2 id='latest-news-title' className={styles.latest__title}>
          Latest news
        </h2>
        <Link
          href='/news'
          className={styles.latest__link}
          aria-label='View all latest news'
        >
          View all{' '}
          <span aria-hidden='true' className={styles.latest__linkArrow}>
            <ArrowRightIcon />
          </span>
        </Link>
      </div>

      {/*
        TODO: можна або перевірку вище перенести, або empty state придумати.
        WarInUkraineSection і SubcategorySection при порожньому масиві повертають null;
        тут без статей лишаються заголовок і "View all" — порожня рамка
      */}
      {articles.length > 0 && (
        <ul className={styles.news}>
          {articles.map((article) => (
            <li key={article.id} className={styles.news__item}>
              <ArticleCardHorizontal article={article} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
