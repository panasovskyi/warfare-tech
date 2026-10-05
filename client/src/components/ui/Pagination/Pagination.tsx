import Link from 'next/link';
import styles from './Pagination.module.scss';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
};

type PageItem = number | 'startEllipsis' | 'endEllipsis';

const getPageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'endEllipsis', totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      'startEllipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'startEllipsis',
    page - 1,
    page,
    page + 1,
    'endEllipsis',
    totalPages,
  ];
};

type ArrowProps = {
  direction: 'prev' | 'next';
  href?: string;
};

const PaginationArrow: React.FC<ArrowProps> = ({ direction, href }) => {
  const icon = (
    <ArrowRightIcon
      className={direction === 'prev' ? styles.pagination__iconPrev : undefined}
    />
  );

  if (!href) {
    return (
      <li aria-hidden='true'>
        <span className={styles.pagination__arrowPlaceholder}>{icon}</span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className={styles.pagination__arrowLink}
        aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
      >
        {icon}
      </Link>
    </li>
  );
};

export const Pagination: React.FC<Props> = ({ page, totalPages, basePath }) => {
  if (totalPages <= 1) return null;

  const getHref = (pageNumber: number) =>
    pageNumber === 1 ? basePath : `${basePath}?page=${pageNumber}`;

  return (
    <nav aria-label='Pagination'>
      <ul className={styles.pagination}>
        <PaginationArrow
          direction='prev'
          href={page > 1 ? getHref(page - 1) : undefined}
        />

        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <Link
                href={getHref(item)}
                className={styles.pagination__link}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </Link>
            </li>
          ) : (
            <li
              key={item}
              className={styles.pagination__ellipsis}
              aria-hidden='true'
            >
              …
            </li>
          ),
        )}

        <PaginationArrow
          direction='next'
          href={page < totalPages ? getHref(page + 1) : undefined}
        />
      </ul>
    </nav>
  );
};
