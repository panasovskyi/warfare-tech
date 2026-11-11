import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './PageCoverSkeleton.module.scss';

type Props = {
  children: React.ReactNode;
};

export const PageCoverSkeleton: React.FC<Props> = ({ children }) => (
  <div className={styles.cover}>
    <Skeleton variant='block' className={styles.cover__photo} />

    <div className={`container ${styles.cover__inner}`}>{children}</div>
  </div>
);
