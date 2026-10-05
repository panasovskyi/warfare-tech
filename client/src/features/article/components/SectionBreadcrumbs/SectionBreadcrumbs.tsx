import Link from 'next/link';
import styles from './SectionBreadcrumbs.module.scss';
import {
  getSectionLabelAndLink,
  type ArticleLabelSection,
} from '@/features/article/article.utils';
import {
  SECTION_ICONS,
  type SubcategoryKey,
} from '@/features/article/article.constants';
import { ChevronRightIcon } from '@/components/icons/ChevronRightIcon';

type Props = {
  section: ArticleLabelSection;
  // Іконка розділу біля його назви. Сторінка розділу вимикає її: там уже є велика
  // іконка в заголовку
  isShowIcon?: boolean;
  // Світлі крихти для кольорового тла (обкладинка розділу): колір розділу на такому
  // тлі зливався б із ним
  isOnImage?: boolean;
  // Остання ланка веде на саму сторінку (сторінка розділу): aria-current повідомляє про це
  // скрінрідеру. На сторінці новини ланка розділу — батьківська, там проп не потрібен
  isCurrentPage?: boolean;
};

// Крихти розділу: News › розділ, для лонгрідів — лише Longreads. Беруть ключ розділу,
// а не статтю: той самий вигляд і на сторінці новини, і на сторінці розділу
export const SectionBreadcrumbs: React.FC<Props> = ({
  section,
  isShowIcon = true,
  isOnImage = false,
  isCurrentPage = false,
}) => {
  const { sectionLabel, href } = getSectionLabelAndLink(section);
  // Лонгріди — не новини, тож без першої ланки "News"
  const isNews = section !== 'longread';
  const SectionIcon =
    isShowIcon && section in SECTION_ICONS
      ? SECTION_ICONS[section as SubcategoryKey]
      : null;

  return (
    <nav aria-label='Breadcrumb'>
      <ol
        className={
          isOnImage
            ? `${styles.breadcrumbs} ${styles['breadcrumbs--onImage']}`
            : styles.breadcrumbs
        }
      >
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
            <Link
              href={href}
              className={styles.breadcrumbs__link}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
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
