import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { SectionBreadcrumbs } from '@/features/article/components/SectionBreadcrumbs/SectionBreadcrumbs';
import { PageCover } from '@/components/ui/PageCover/PageCover';
import {
  isNewsSectionKey,
  NEWS_SECTIONS,
  type NewsSection,
} from '@/features/article/article.constants';
import { SectionIcon } from '@/features/article/components/SectionIcon/SectionIcon';
import styles from './NewsSectionPage.module.scss';
import { SectionsList } from '@/app/news/_components/SectionsList/SectionsList';
import { SectionNewsList } from '@/app/news/_components/SectionNewsList/SectionNewsList';
import { SectionNewsListSkeleton } from '@/app/news/_components/SectionNewsListSkeleton/SectionNewsListSkeleton';
import { getPageNumber } from '@/lib/api/pagination';

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { section } = await params;
  const { page } = await searchParams;

  if (!isNewsSectionKey(section)) {
    notFound();
  }

  const { label, description } = NEWS_SECTIONS[section];
  const pageNumber = getPageNumber(page);

  return {
    title:
      pageNumber === 1
        ? `${label} news`
        : `${label} news — page ${pageNumber}`,
    description,
    alternates: {
      canonical:
        pageNumber === 1
          ? `/news/${section}`
          : `/news/${section}?page=${pageNumber}`,
    },
  };
}

export default async function NewsSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const { page } = await searchParams;
  const normalizedPage = getPageNumber(page);

  if (!isNewsSectionKey(section)) {
    notFound();
  }

  const { label, description, cover }: NewsSection = NEWS_SECTIONS[section];

  return (
    <div className={styles.page}>
      <PageCover section={section} cover={cover}>
        <SectionBreadcrumbs
          section={section}
          isShowIcon={false}
          isOnImage
          isCurrentPage
        />
        <div className={styles.page__titleWrapper}>
          <SectionIcon section={section} className={styles.page__icon} />
          <h1 className={styles.page__title}>{label}</h1>
        </div>
        <p className={styles.page__description}>{description}</p>
      </PageCover>

      <div className={`container ${styles.page__content}`}>
        <SectionsList activeSection={section} />

        <Suspense
          key={normalizedPage}
          fallback={
            <>
              <p role='status' className='sr-only'>
                Loading news…
              </p>
              <SectionNewsListSkeleton />
            </>
          }
        >
          <SectionNewsList section={section} page={normalizedPage} />
        </Suspense>
      </div>
    </div>
  );
}
