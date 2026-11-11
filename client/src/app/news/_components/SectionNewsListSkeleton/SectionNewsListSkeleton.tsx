import styles from '@/app/news/[section]/NewsSectionPage.module.scss';
import { ArticleCardSkeleton } from '@/features/article/components/ArticleCardSkeleton/ArticleCardSkeleton';

const GRID_CARDS = 6;

export const SectionNewsListSkeleton = () => {
  return (
    <div className={styles.news}>
      <div className={styles.news__list}>
        {Array.from({ length: GRID_CARDS }, (_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
