import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './ArticleCardSkeleton.module.scss';

type Props = {
  // Картка з описом (Lead, Grid, Vertical) чи без нього (Side, Compact)
  hasDescription?: boolean;
};

// Заглушка вертикальної картки: фото, заголовок, опис і короткий рядок з автором.
// Одна на Lead, Side, Grid, Vertical і Compact: вони різного розміру, але одної форми,
// а розмір задає колонка, в якій заглушка стоїть
export const ArticleCardSkeleton: React.FC<Props> = ({
  hasDescription = true,
}) => (
  <div className={styles.card}>
    <Skeleton variant='photo' />
    <Skeleton variant='title' />
    {hasDescription && <Skeleton variant='line' />}
    <Skeleton variant='lineShort' />
  </div>
);
