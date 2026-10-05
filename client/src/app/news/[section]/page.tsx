import { notFound } from 'next/navigation';
import { SectionBreadcrumbs } from '@/features/article/components/SectionBreadcrumbs/SectionBreadcrumbs';
import {
  isNewsSectionKey,
  NEWS_SECTIONS,
} from '@/features/article/article.constants';
import { SectionIcon } from '@/features/article/components/SectionIcon/SectionIcon';
import styles from './NewsSectionPage.module.scss';
import { SectionsList } from '@/app/news/_components/SectionsList/SectionsList';
import { articleApi } from '@/features/article/article.api';
import { ArticleCategory } from '@/features/article/article.types';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { ArticleCardGrid } from '@/features/article/components/ArticleCardGrid/ArticleCardGrid';

// TODO: розбір page разом із MAX_PAGE — копія з news/page.tsx. Одна спільна функція
// (наприклад, у lib/api/pagination.ts) — де їй жити, вирішуєш ти
const MAX_PAGE = 999;

type Props = {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

// TODO: generateMetadata — title "<розділ> — Warfare Tech" і опис; разом із загальним
// TODO про metadata в layout.tsx
export default async function NewsSectionPage({ params, searchParams }: Props) {
  const { section } = await params;
  const { page } = await searchParams;
  const pageNumber = typeof page === 'string' ? Number(page) : NaN;
  const normalizedPage =
    Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= MAX_PAGE
      ? pageNumber
      : 1;

  // З адреси приходить будь-який рядок: невідомий розділ — 404, до будь-яких запитів
  if (!isNewsSectionKey(section)) {
    notFound();
  }

  // TODO: кешування — як у news/page.tsx: сторінка динамічна через searchParams, рішення
  // одне на всі списки (TODO в app/page.tsx)
  const news = await articleApi.getArticles({
    category: ArticleCategory.NEWS,
    ...NEWS_SECTIONS[section].filter,
    limit: 12,
    page: normalizedPage,
  });

  const { items, total, totalPages } = news;

  // Сторінка за межами діапазону — 404, а не порожній список. total === 0 — порожній
  // розділ, це не помилка адреси
  if (total > 0 && normalizedPage > totalPages) {
    notFound();
  }

  const { label } = NEWS_SECTIONS[section];

  return (
    <div className={styles.page}>
      {/*
        Обкладинка на всю ширину: фон на header, .container всередині. Колір розділу — за
        data-section, текст світлий.
        TODO: фото обкладинки (у макеті). Варіанти: (a) статичні фото в public/ і поле в
        NEWS_SECTIONS, (b) фото найновішої статті розділу (узгоджено лише на сторінці 1),
        (c) без фото, лише колір — як зараз. З фото потрібні Image fill і градієнт
        --gradient-image-overlay (див. HeroSection).
        TODO: опис розділу під h1 (у макеті є) — поле description в NEWS_SECTIONS, тексти
        для семи розділів пишеш ти.
        TODO: прапор у заголовку Ukraine на синій обкладинці: верхня половина прапора
        зливається з тлом — потрібне інше тло для цього розділу або підкладка під прапор
      */}
      <header className={styles.page__cover} data-section={section}>
        <div className={`container ${styles.page__coverInner}`}>
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
        </div>
      </header>

      <div className={`container ${styles.page__content}`}>
        <SectionsList activeSection={section} />

        {/* Новин у розділі немає: ні списку, ні пагінації */}
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
