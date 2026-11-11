import Link from 'next/link';
import styles from './SectionBreadcrumbs.module.scss';
import {
  getSectionLabelAndLink,
  type ArticleLabelSection,
} from '@/features/article/article.utils';
import { SectionIcon } from '@/features/article/components/SectionIcon/SectionIcon';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';

type Props = {
  section: ArticleLabelSection;
  isShowIcon?: boolean;
  isOnImage?: boolean;
  isCurrentPage?: boolean;
};

export const SectionBreadcrumbs: React.FC<Props> = ({
  section,
  isShowIcon = true,
  isOnImage = false,
  isCurrentPage = false,
}) => {
  const { sectionLabel, href } = getSectionLabelAndLink(section);

  return (
    <nav aria-label='Breadcrumb'>
      <ol
        className={
          isOnImage
            ? `${styles.breadcrumbs} ${styles['breadcrumbs--onImage']}`
            : styles.breadcrumbs
        }
      >
        <li className={styles.breadcrumbs__item}>
          <Link href='/news' className={styles.breadcrumbs__link}>
            News
          </Link>
        </li>

        {section !== 'news' && (
          <li className={styles.breadcrumbs__item} data-section={section}>
            <ChevronRightIcon className={styles.breadcrumbs__separator} />
            <Link
              href={href}
              className={styles.breadcrumbs__link}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {isShowIcon && (
                <SectionIcon
                  section={section}
                  className={styles.breadcrumbs__icon}
                />
              )}
              {sectionLabel}
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
};
