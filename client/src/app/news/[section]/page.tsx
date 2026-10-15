import type { Metadata } from 'next';
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
import { articleApi } from '@/features/article/article.api';
import { ArticleType } from '@/features/article/article.types';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { ArticleCardGrid } from '@/features/article/components/ArticleCardGrid/ArticleCardGrid';
import { getPageNumber } from '@/lib/api/pagination';

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

// Опис розділу береться з NEWS_SECTIONS: той самий текст стоїть під заголовком обкладинки.
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
  };
}

export default async function NewsSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const { page } = await searchParams;
  const normalizedPage = getPageNumber(page);

  if (!isNewsSectionKey(section)) {
    notFound();
  }

  const news = await articleApi.getArticles({
    type: ArticleType.NEWS,
    ...NEWS_SECTIONS[section].filter,
    limit: 12,
    page: normalizedPage,
  });

  const { items, total, totalPages } = news;

  if (total > 0 && normalizedPage > totalPages) {
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

        {items.length === 0 ? (
          <EmptyState
            title='No news to show right now'
            description='Please check back a little later.'
          />
        ) : (
          <section className={styles.news} aria-label={`${label} news`}>
            <ul className={styles.news__list}>
              {items.map((item) => (
                <li key={item.id}>
                  <ArticleCardGrid article={item} headingLevel={2} />
                </li>
              ))}
            </ul>

            <div className={styles.news__pagination}>
              <Pagination
                page={normalizedPage}
                totalPages={totalPages}
                basePath={`/news/${section}`}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
