import type { Metadata } from 'next';
import { Suspense } from 'react';
import styles from './NewsPage.module.scss';
import { PageCover } from '@/components/ui/PageCover/PageCover';
import { NEWS_PAGE_COVER } from '@/features/article/article.constants';
import { SectionsList } from '@/app/news/_components/SectionsList/SectionsList';
import { NewsList } from '@/app/news/_components/NewsList/NewsList';
import { NewsListSkeleton } from '@/app/news/_components/NewsListSkeleton/NewsListSkeleton';
import { getPageNumber } from '@/lib/api/pagination';

type Props = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNumber = getPageNumber(page);

  return {
    title: pageNumber === 1 ? 'News' : `News — page ${pageNumber}`,
    description:
      'Every story across air, land, naval, space, cyber, UAV and the war in Ukraine, newest first.',
    alternates: {
      canonical: pageNumber === 1 ? '/news' : `/news?page=${pageNumber}`,
    },
  };
}

export default async function NewsPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const normalizedPage = getPageNumber(page);

  return (
    <div className={styles.page}>
      <PageCover cover={NEWS_PAGE_COVER}>
        <h1 className={styles.page__title}>News</h1>
        <p className={styles.page__description}>
          Every story across air, land, naval, space, cyber, UAV and the war in
          Ukraine, newest first.
        </p>
      </PageCover>

      <div className={`container ${styles.page__inner}`}>
        <SectionsList />

        <Suspense
          key={normalizedPage}
          fallback={
            <>
              <p role='status' className='sr-only'>
                Loading news…
              </p>
              <NewsListSkeleton hasTopStories={normalizedPage === 1} />
            </>
          }
        >
          <NewsList page={normalizedPage} />
        </Suspense>
      </div>
    </div>
  );
}
