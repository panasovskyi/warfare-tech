import Link from 'next/link';
import styles from './LatestSection.module.scss';
import { ArticleCardHorizontal } from '@/features/article/components/ArticleCardHorizontal/ArticleCardHorizontal';
import { ArticleListItem } from '@/features/article/article.types';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

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
        {articles.length > 0 && (
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
        )}
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title='No news to show right now'
          description='Please check back a little later.'
        />
      ) : (
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
