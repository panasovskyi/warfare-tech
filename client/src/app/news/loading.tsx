import styles from './NewsPage.module.scss';
import loadingStyles from './NewsLoading.module.scss';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { PageCoverSkeleton } from '@/components/ui/PageCoverSkeleton/PageCoverSkeleton';
import { SectionsListSkeleton } from '@/app/news/_components/SectionsListSkeleton/SectionsListSkeleton';
import { NewsListSkeleton } from '@/app/news/_components/NewsListSkeleton/NewsListSkeleton';

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

        <NewsListSkeleton />
      </div>
    </div>
  );
}
