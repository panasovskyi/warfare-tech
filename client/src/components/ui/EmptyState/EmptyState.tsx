import styles from './EmptyState.module.scss';

type Props = {
  // Коротко, що сталося: "No news to show right now"
  title: string;
  // Необов'язкове пояснення або що робити далі
  description?: string;
};

// Заглушка на місці порожнього списку. Текст — звичайні абзаци, не заголовок:
// у секції вже є свій h2
export const EmptyState: React.FC<Props> = ({ title, description }) => (
  <div className={styles.empty}>
    <p className={styles.empty__title}>{title}</p>
    {description && <p className={styles.empty__description}>{description}</p>}
  </div>
);
