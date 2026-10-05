import Link from 'next/link';
import styles from './SectionsList.module.scss';
import {
  NEWS_SECTIONS,
  NewsSectionKey,
} from '@/features/article/article.constants';
import { SectionIcon } from '@/features/article/components/SectionIcon/SectionIcon';

const SECTIONS = Object.entries(NEWS_SECTIONS);

type Props = {
  // Ключ відкритого розділу. На /news розділу немає — тоді активний чип "All"
  activeSection?: NewsSectionKey;
};

export const SectionsList: React.FC<Props> = ({ activeSection }) => {
  return (
    <nav aria-label='News sections'>
      <ul className={styles.section}>
        <li>
          <Link
            href={'/news'}
            className={styles.section__link}
            aria-current={!activeSection ? 'page' : undefined}
          >
            All
          </Link>
        </li>
        {SECTIONS.map(([key, value]) => {
          return (
            <li key={key}>
              <Link
                href={`/news/${key}`}
                className={styles.section__link}
                data-section={key}
                aria-current={key === activeSection ? 'page' : undefined}
              >
                <SectionIcon section={key} className={styles.section__icon} />
                {value.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
