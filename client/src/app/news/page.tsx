import type { Metadata } from 'next';
import styles from './NewsPage.module.scss';
import { PageCover } from '@/components/ui/PageCover/PageCover';
import { NEWS_PAGE_COVER } from '@/features/article/article.constants';
import { articleApi } from '@/features/article/article.api';
import { ArticleType } from '@/features/article/article.types';
import { ArticleCardLead } from '@/features/article/components/ArticleCardLead/ArticleCardLead';
import { ArticleCardSide } from '@/features/article/components/ArticleCardSide/ArticleCardSide';
import { ArticleCardRow } from '@/features/article/components/ArticleCardRow/ArticleCardRow';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { SectionsList } from '@/app/news/_components/SectionsList/SectionsList';
import { notFound } from 'next/navigation';
import { getPageNumber } from '@/lib/api/pagination';

const TOP_STORIES_COUNT = 3;

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
  };
}

export default async function NewsPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const normalizedPage = getPageNumber(page);

  const articlesResponse = await articleApi.getArticles({
    type: ArticleType.NEWS,
    limit: 9,
    page: normalizedPage,
  });

  const { items, totalPages, total } = articlesResponse;

  if (total > 0 && totalPages < normalizedPage) {
    return notFound();
  }

  const topCount = normalizedPage === 1 ? TOP_STORIES_COUNT : 0;
  const [firstTop, secondTop, thirdTop] = items.slice(0, topCount);
  const latestNews = items.slice(topCount);

 
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

        {items.length === 0 && (
          <EmptyState
            title='No news to show right now'
            description='Please check back a little later.'
          />
        )}

        {firstTop && (
          <section className={styles.topStories} aria-label='Top stories'>
            <div className={styles.topStories__left}>
              <ArticleCardLead article={firstTop} headingLevel={2} preload />
            </div>
            {secondTop && (
              <div className={styles.topStories__right}>
                <ArticleCardSide article={secondTop} headingLevel={2} />
                {thirdTop && (
                  <ArticleCardSide article={thirdTop} headingLevel={2} />
                )}
              </div>
            )}
          </section>
        )}

        {latestNews.length > 0 && (
          <div className={styles.page__content}>
            <section
              className={styles.latest}
              aria-labelledby='latest-news-title'
            >
              <h2 id='latest-news-title' className={styles.latest__title}>
                Latest
              </h2>
              <ul className={styles.latest__list}>
                {latestNews.map((item) => (
                  <li key={item.id} className={styles.latest__item}>
                    <ArticleCardRow article={item} />
                  </li>
                ))}
              </ul>
            </section>
            <Pagination
              page={normalizedPage}
              totalPages={totalPages}
              basePath='/news'
            />
          </div>
        )}
      </div>
    </div>
  );
}
