import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { NEWS_SECTIONS } from '@/features/article/article.constants';
import styles from './SectionsListSkeleton.module.scss';

const CHIPS_COUNT = Object.keys(NEWS_SECTIONS).length + 1;

export const SectionsListSkeleton: React.FC = () => (
  <div className={styles.chips}>
    {Array.from({ length: CHIPS_COUNT }, (_, index) => (
      <Skeleton key={index} variant='chip' />
    ))}
  </div>
);
