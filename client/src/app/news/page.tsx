import styles from './NewsPage.module.scss';
import { articleApi } from '@/features/article/article.api';
import { ArticleCategory } from '@/features/article/article.types';
import { ArticleCardLead } from '@/features/article/components/ArticleCardLead/ArticleCardLead';
import { ArticleCardSide } from '@/features/article/components/ArticleCardSide/ArticleCardSide';
import { ArticleCardRow } from '@/features/article/components/ArticleCardRow/ArticleCardRow';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { SectionsList } from '@/app/news/_components/SectionsList/SectionsList';

const MAX_PAGE = 999;
const TOP_STORIES_COUNT = 3;

type Props = {
  searchParams: Promise<{ page?: string | string[] }>;
};

// TODO: generateMetadata — title "News — Warfare Tech" і опис; для ?page=N окремий title
// і canonical (зараз "Create Next App", див. TODO про metadata в layout.tsx)
export default async function NewsPage({ searchParams }: Props) {
  const { page } = await searchParams;

  const pageNumber = typeof page === 'string' ? Number(page) : NaN;
  const normalizedPage =
    Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= MAX_PAGE
      ? pageNumber
      : 1;

  // TODO: page > totalPages при total > 0 (наприклад, ?page=50) зараз дає 200 і "No news…"
  // без пагінації. Як у news/[section]: 404 (потрібен total із відповіді)
  // TODO: loading.tsx для news/, news/[section]/ і [slug]/: сторінки динамічні, при кліку на
  // чип чи сторінку пагінації нічого не видно, доки API не відповість
  // TODO: кешування — сторінка динамічна через searchParams. Рішення одне на головну,
  // статтю і списки (TODO в app/page.tsx)
  const articlesResponse = await articleApi.getArticles({
    category: ArticleCategory.NEWS,
    limit: 9,
    page: normalizedPage,
  });

  const { items, totalPages } = articlesResponse;

  const topCount = normalizedPage === 1 ? TOP_STORIES_COUNT : 0;
  const [firstTop, secondTop, thirdTop] = items.slice(0, topCount);
  const latestNews = items.slice(topCount);

 
  return (
    <div className={styles.page}>
      <div className={`container ${styles.page__inner}`}>
        <header className={styles.page__header}>
          <h1 className={styles.page__title}>News</h1>
          <p className={styles.page__description}>
            Every story across air, land, naval, space, cyber, UAV and the war
            in Ukraine, newest first.
          </p>
        </header>
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
            {/* TODO: коли з'явиться aside — пагінація має стояти під списком у лівій колонці */}
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
