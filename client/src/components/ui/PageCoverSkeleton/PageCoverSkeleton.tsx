import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import styles from './PageCoverSkeleton.module.scss';

type Props = {
  // Заглушки тексту обкладинки (заголовок, опис): стоять знизу, як справжній текст
  children: React.ReactNode;
};

// Заглушка обкладинки з фото (PageCover) на час завантаження: та сама висота й той самий блок
// фото праворуч (розміри з variables.scss), тож коли справжня обкладинка замінює її,
// контент нижче не стрибає. Усі обкладинки сайту з фото, тому loading.tsx завжди малює саме
// таку; loading.tsx не знає, чи є фото в розділу (він не отримує params)
export const PageCoverSkeleton: React.FC<Props> = ({ children }) => (
  <div className={styles.cover}>
    <Skeleton variant='block' className={styles.cover__photo} />

    <div className={`container ${styles.cover__inner}`}>{children}</div>
  </div>
);
