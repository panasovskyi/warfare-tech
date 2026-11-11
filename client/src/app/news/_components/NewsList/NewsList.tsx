import { notFound } from 'next/navigation';
import styles from '@/app/news/NewsPage.module.scss';
import { articleApi } from '@/features/article/article.api';
import { ArticleType } from '@/features/article/article.types';
import { ArticleCardLead } from '@/features/article/components/ArticleCardLead/ArticleCardLead';
import { ArticleCardSide } from '@/features/article/components/ArticleCardSide/ArticleCardSide';
import { ArticleCardRow } from '@/features/article/components/ArticleCardRow/ArticleCardRow';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

const TOP_STORIES_COUNT = 3;

type Props = {
  page: number;
};

// Частина сторінки /news, що залежить від номера сторінки: сама ходить за даними, тож
// сторінка може обгорнути її в <Suspense key={page}> і показати заглушку на час запиту
export const NewsList = async ({ page }: Props) => {
  const { items, totalPages, total } = await articleApi.getArticles({
    type: ArticleType.NEWS,
    limit: 9,
    page,
  });

  if (total > 0 && totalPages < page) {
    notFound();
  }

  const topCount = page === 1 ? TOP_STORIES_COUNT : 0;
  const [firstTop, secondTop, thirdTop] = items.slice(0, topCount);
  const latestNews = items.slice(topCount);

  return (
    <>
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
          <Pagination page={page} totalPages={totalPages} basePath='/news' />
        </div>
      )}
    </>
  );
};
