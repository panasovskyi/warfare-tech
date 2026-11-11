import styles from './EmptyState.module.scss';

type Props = {
  title: string;
  description?: string;
};

export const EmptyState: React.FC<Props> = ({ title, description }) => (
  <div className={styles.empty}>
    <p className={styles.empty__title}>{title}</p>
    {description && <p className={styles.empty__description}>{description}</p>}
  </div>
);
