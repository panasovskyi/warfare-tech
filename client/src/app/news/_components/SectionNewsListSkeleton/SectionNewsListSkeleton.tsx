import styles from '@/app/news/[section]/NewsSectionPage.module.scss';
import { ArticleCardSkeleton } from '@/features/article/components/ArticleCardSkeleton/ArticleCardSkeleton';

const GRID_CARDS = 6;

// Заглушка сітки новин розділу: її показують і loading.tsx (перший вхід у розділ), і
// <Suspense> у сторінці (перехід між ?page=N, де loading.tsx не спрацьовує)
export const SectionNewsListSkeleton = () => {
  return (
    <div className={styles.news}>
      <div className={styles.news__list}>
        {Array.from({ length: GRID_CARDS }, (_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
