import styles from './TextPage.module.scss';

type Props = {
  title: string;
  lead: string;
  children: React.ReactNode;
};

export const TextPage: React.FC<Props> = ({ title, lead, children }) => (
  <div className={styles.textPage}>
    <div className={`container ${styles.textPage__inner}`}>
      <header className={styles.textPage__header}>
        <h1 className={styles.textPage__title}>{title}</h1>
        <p className={styles.textPage__lead}>{lead}</p>
      </header>

      <div className={styles.textPage__body}>{children}</div>
    </div>
  </div>
);
