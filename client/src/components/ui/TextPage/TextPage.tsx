import styles from './TextPage.module.scss';

type Props = {
  title: string;
  // Вступ під заголовком: одне-два речення про сторінку
  lead: string;
  // Вміст: розділи (section з h2), абзаци, списки, посилання. Їхній вигляд задає цей
  // компонент, сторінка несе лише текст
  children: React.ReactNode;
};

// Сторінка з текстом (About, Contact): заголовок, вступ і колонка тексту тієї ж ширини, що
// й у статті. Це вміст усієї сторінки, тому заголовок тут h1
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
