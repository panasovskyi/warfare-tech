import styles from '@/app/news/NewsPage.module.scss';
import loadingStyles from '@/app/news/NewsLoading.module.scss';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { ArticleCardSkeleton } from '@/features/article/components/ArticleCardSkeleton/ArticleCardSkeleton';
import { ArticleRowSkeleton } from '@/features/article/components/ArticleRowSkeleton/ArticleRowSkeleton';

const LATEST_ROWS = 6;

type Props = {
  hasTopStories?: boolean;
};

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
