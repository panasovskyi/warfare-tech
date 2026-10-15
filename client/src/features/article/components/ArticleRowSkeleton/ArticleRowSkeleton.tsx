import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './ArticleRowSkeleton.module.scss';

// Заглушка рядка списку: мініатюра зліва, справа мітка, заголовок, опис і рядок з автором.
// Одна на Row і Horizontal
export const ArticleRowSkeleton: React.FC = () => (
  <div className={styles.row}>
    <Skeleton variant='thumb' />

    <div className={styles.row__content}>
      <Skeleton variant='lineShort' />
      <Skeleton variant='title' />
      <Skeleton variant='line' />
      <Skeleton variant='lineShort' />
    </div>
  </div>
);
