import Link from 'next/link';
import styles from './ArrowLink.module.scss';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';

type Props = {
  href: string;
  children: React.ReactNode;
  // Розташування задає батько: align-self у flex-колонці, margin-left: auto у рядку
  className?: string;
  // Коли видимий текст ("View all") не каже, куди веде посилання
  'aria-label'?: string;
};

// Посилання-перехід зі стрілкою: "View all", "View full coverage", "More from this author".
// Один вигляд на головній і на сторінці новини
export const ArrowLink: React.FC<Props> = ({
  href,
  children,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <Link
      href={href}
      className={className ? `${styles.link} ${className}` : styles.link}
      aria-label={ariaLabel}
    >
      {children}
      <ArrowRightIcon className={styles.link__arrow} />
    </Link>
  );
};
