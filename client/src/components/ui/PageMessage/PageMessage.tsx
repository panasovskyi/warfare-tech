import Link from 'next/link';
import styles from './PageMessage.module.scss';

type LinkAction = {
  label: string;
  href: string;
};

type ButtonAction = {
  label: string;
  onClick: () => void;
};

type Props = {
  title: string;
  description: string;
  primaryAction: LinkAction | ButtonAction;
  secondaryAction?: LinkAction;
};

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
