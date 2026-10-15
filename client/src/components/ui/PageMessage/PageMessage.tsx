import Link from 'next/link';
import styles from './PageMessage.module.scss';

type LinkAction = {
  label: string;
  href: string;
};

// Для error.tsx: "Try again" не веде на іншу адресу, а перезапитує дані
type ButtonAction = {
  label: string;
  onClick: () => void;
};

type Props = {
  title: string;
  description: string;
  // Головна дія: виглядає як кнопка. Посилання (404, заглушки) або справжня кнопка
  // (помилка). onClick передавати лише з клієнтського компонента, як error.tsx: функцію не
  // можна передати із серверного. Директиви 'use client' тут немає навмисно: у серверних
  // сторінках приходять лише посилання, а error.tsx клієнтський і тягне компонент у свій пакет
  primaryAction: LinkAction | ButtonAction;
  // Необов'язкова друга дія: звичайне посилання
  secondaryAction?: LinkAction;
};

// Коротке повідомлення по центру на всю сторінку: 404, помилка, заглушка. Це вміст усієї
// сторінки, тому заголовок тут h1. Вертикальне повітря навколо дає сам компонент
export const PageMessage: React.FC<Props> = ({
  title,
  description,
  primaryAction,
  secondaryAction,
}) => (
  <div className={`container ${styles.pageMessage}`}>
    <h1 className={styles.pageMessage__title}>{title}</h1>

    <p className={styles.pageMessage__text}>{description}</p>

    <div className={styles.pageMessage__actions}>
      {'href' in primaryAction ? (
        <Link href={primaryAction.href} className={styles.pageMessage__button}>
          {primaryAction.label}
        </Link>
      ) : (
        <button
          type='button'
          className={styles.pageMessage__button}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </button>
      )}

      {secondaryAction && (
        <Link href={secondaryAction.href} className={styles.pageMessage__link}>
          {secondaryAction.label}
        </Link>
      )}
    </div>
  </div>
);
