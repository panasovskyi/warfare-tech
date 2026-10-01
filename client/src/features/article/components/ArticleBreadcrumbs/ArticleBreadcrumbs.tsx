import Link from 'next/link';
import styles from './ArticleBreadcrumbs.module.scss';
import {
  ArticleCategory,
  type ArticleListItem,
} from '@/features/article/article.types';
import { getSectionTagAndLink } from '@/features/article/article.utils';
import {
  SECTION_ICONS,
  type SubcategoryKey,
} from '@/features/article/article.constants';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';

type Props = {
  article: ArticleListItem;
};

export const ArticleBreadcrumbs: React.FC<Props> = ({ article }) => {
  const { label, href, section } = getSectionTagAndLink(article);
  const isNews = article.category === ArticleCategory.NEWS;
  const sectionLabel = section === 'longread' ? 'Longreads' : label;
  const SectionIcon =
    section in SECTION_ICONS ? SECTION_ICONS[section as SubcategoryKey] : null;


  return (
    <nav aria-label='Breadcrumb'>
      <ol className={styles.breadcrumbs}>
        {isNews && (
          <li className={styles.breadcrumbs__item}>
            <Link href='/news' className={styles.breadcrumbs__link}>
              News
            </Link>
          </li>
        )}

        {section !== 'news' && (
          <li className={styles.breadcrumbs__item} data-section={section}>
            {isNews && (
              <ChevronRightIcon className={styles.breadcrumbs__separator} />
            )}
            <Link href={href} className={styles.breadcrumbs__link}>
              {SectionIcon && (
                <SectionIcon className={styles.breadcrumbs__icon} />
              )}
              {sectionLabel}
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
};
