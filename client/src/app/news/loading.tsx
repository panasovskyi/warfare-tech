import styles from './NewsPage.module.scss';
import loadingStyles from './NewsLoading.module.scss';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { PageCoverSkeleton } from '@/components/ui/PageCoverSkeleton/PageCoverSkeleton';
import { SectionsListSkeleton } from '@/app/news/_components/SectionsListSkeleton/SectionsListSkeleton';
import { ArticleCardSkeleton } from '@/features/article/components/ArticleCardSkeleton/ArticleCardSkeleton';
import { ArticleRowSkeleton } from '@/features/article/components/ArticleRowSkeleton/ArticleRowSkeleton';

const LATEST_ROWS = 6;
export default function NewsLoading() {
  return (
    <div className={styles.page}>
      <p role='status' className='sr-only'>
        Loading news…
      </p>

      <PageCoverSkeleton>
        <Skeleton variant='heading' />
        <div className={loadingStyles.description}>
          <Skeleton variant='line' />
          <Skeleton variant='lineShort' />
        </div>
      </PageCoverSkeleton>

      <div className={`container ${styles.page__inner}`}>
        <SectionsListSkeleton />

        <div className={styles.topStories}>
          <div className={styles.topStories__left}>
            <ArticleCardSkeleton />
          </div>
          <div className={styles.topStories__right}>
            <ArticleCardSkeleton hasDescription={false} />
            <ArticleCardSkeleton hasDescription={false} />
          </div>
        </div>

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
      </div>
    </div>
  );
}
