import Link from 'next/link';
import styles from './WarInUkraineSection.module.scss';
import { ArticleListItem } from '@/features/article/article.types';
import { ArticleCardVertical } from '@/features/article/components/ArticleCardVertical/ArticleCardVertical';
import { ArticleHeadline } from '@/features/article/components/ArticleHeadline/ArticleHeadline';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';
import { UkraineFlagIcon } from '@/components/icons/UkraineFlagIcon';

type Props = {
  articles: ArticleListItem[];
};

export const WarInUkraineSection: React.FC<Props> = ({ articles }) => {
  const [featured, ...rest] = articles;

  if (!featured) return null;

  return (
    <section className={styles.ukraine} aria-labelledby='war-in-ukraine-title'>
      {/*
        TODO: прапорну смужку намалювати через .ukraine::before у SCSS —
        вона декоративна, окремий елемент у розмітці не потрібен
      */}
      <div className={styles.ukraine__top}>
        <div className={styles.ukraine__heading}>
          <h2 id='war-in-ukraine-title' className={styles.ukraine__title}>
            <UkraineFlagIcon />
            War in Ukraine
          </h2>
          <p className={styles.ukraine__subtitle}>— ongoing coverage</p>
        </div>

        <Link href={'/news/ukraine'} className={styles.ukraine__sectionLink}>
          View full coverage
          <ArrowRightIcon />
        </Link>
      </div>

      <div className={styles.ukraine__content}>
        <ArticleCardVertical article={featured} />

        { /** в теорії можна якийсь empty state придумать */}
        {rest.length > 0 && (
          <div className={styles.ukraine__latest}>
            <h3 className={styles.ukraine__latestTitle}>Latest news</h3>
            <ul className={styles.ukraine__news}>
              {rest.map((article) => (
                <li key={article.id} className={styles.ukraine__newsItem}>
                  <ArticleHeadline isShowTime article={article} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
