import { notFound } from 'next/navigation';
import styles from '@/app/news/[section]/NewsSectionPage.module.scss';
import { articleApi } from '@/features/article/article.api';
import {
  NEWS_SECTIONS,
  type NewsSectionKey,
} from '@/features/article/article.constants';
import { ArticleType } from '@/features/article/article.types';
import { ArticleCardGrid } from '@/features/article/components/ArticleCardGrid/ArticleCardGrid';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

type Props = {
  section: NewsSectionKey;
  page: number;
};

// Частина сторінки розділу, що залежить від номера сторінки: сама ходить за даними, тож
// сторінка може обгорнути її в <Suspense key={page}> і показати заглушку на час запиту
export const SectionNewsList = async ({ section, page }: Props) => {
  const { items, total, totalPages } = await articleApi.getArticles({
    type: ArticleType.NEWS,
    ...NEWS_SECTIONS[section].filter,
    limit: 12,
    page,
  });

  if (total > 0 && page > totalPages) {
    notFound();
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title='No news to show right now'
        description='Please check back a little later.'
      />
    );
  }

  return (
    <section
      className={styles.news}
      aria-label={`${NEWS_SECTIONS[section].label} news`}
    >
      <ul className={styles.news__list}>
        {items.map((item) => (
          <li key={item.id}>
            <ArticleCardGrid article={item} headingLevel={2} />
          </li>
        ))}
      </ul>

      <div className={styles.news__pagination}>
        <Pagination
          page={page}
          totalPages={totalPages}
          basePath={`/news/${section}`}
        />
      </div>
    </section>
  );
};
