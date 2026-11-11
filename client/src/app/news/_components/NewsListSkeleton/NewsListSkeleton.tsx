import styles from '@/app/news/NewsPage.module.scss';
import loadingStyles from '@/app/news/NewsLoading.module.scss';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { ArticleCardSkeleton } from '@/features/article/components/ArticleCardSkeleton/ArticleCardSkeleton';
import { ArticleRowSkeleton } from '@/features/article/components/ArticleRowSkeleton/ArticleRowSkeleton';

const LATEST_ROWS = 6;

type Props = {
  // Top stories є лише на першій сторінці списку
  hasTopStories?: boolean;
};

// Заглушка списку новин: її показують і loading.tsx (перший вхід на /news), і <Suspense>
// у сторінці (перехід між ?page=N, де loading.tsx не спрацьовує)
export const NewsListSkeleton = ({ hasTopStories = true }: Props) => {
  return (
    <>
      {hasTopStories && (
        <div className={styles.topStories}>
          <div className={styles.topStories__left}>
            <ArticleCardSkeleton />
          </div>
          <div className={styles.topStories__right}>
            <ArticleCardSkeleton hasDescription={false} />
            <ArticleCardSkeleton hasDescription={false} />
          </div>
        </div>
      )}

      <div className={styles.page__content}>
        <div className={styles.latest}>
          <Skeleton variant='title' className={loadingStyles.latestTitle} />
          {Array.from({ length: LATEST_ROWS }, (_, index) => (
            <div key={index} className={styles.latest__item}>
              <ArticleRowSkeleton />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
