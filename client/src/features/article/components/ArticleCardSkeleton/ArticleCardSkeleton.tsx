import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './ArticleCardSkeleton.module.scss';

type Props = {
  hasDescription?: boolean;
};

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
