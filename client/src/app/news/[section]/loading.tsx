import styles from './NewsSectionPage.module.scss';
import loadingStyles from './NewsSectionLoading.module.scss';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { PageCoverSkeleton } from '@/components/ui/PageCoverSkeleton/PageCoverSkeleton';
import { SectionsListSkeleton } from '@/app/news/_components/SectionsListSkeleton/SectionsListSkeleton';
import { ArticleCardSkeleton } from '@/features/article/components/ArticleCardSkeleton/ArticleCardSkeleton';

const GRID_CARDS = 6;

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

        <div className={styles.news}>
          <div className={styles.news__list}>
            {Array.from({ length: GRID_CARDS }, (_, index) => (
              <ArticleCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
