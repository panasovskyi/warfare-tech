import Link from 'next/link';
import styles from './ArrowLink.module.scss';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

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
