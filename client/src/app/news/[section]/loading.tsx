import styles from './NewsSectionPage.module.scss';
import loadingStyles from './NewsSectionLoading.module.scss';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { PageCoverSkeleton } from '@/components/ui/PageCoverSkeleton/PageCoverSkeleton';
import { SectionsListSkeleton } from '@/app/news/_components/SectionsListSkeleton/SectionsListSkeleton';
import { SectionNewsListSkeleton } from '@/app/news/_components/SectionNewsListSkeleton/SectionNewsListSkeleton';

export default function NewsSectionLoading() {
  return (
    <div className={styles.page}>
      <p role='status' className='sr-only'>
        Loading news…
      </p>

      <PageCoverSkeleton>
        <Skeleton variant='lineShort' className={loadingStyles.breadcrumbs} />
        <Skeleton variant='heading' />
        <Skeleton variant='line' className={loadingStyles.description} />
      </PageCoverSkeleton>

      <div className={`container ${styles.page__content}`}>
        <SectionsListSkeleton />

        <SectionNewsListSkeleton />
      </div>
    </div>
  );
}
