import styles from './WarInUkraineSection.module.scss';
import { ArticleListItem } from '@/features/article/article.types';
import { ArticleCardVertical } from '@/features/article/components/ArticleCardVertical/ArticleCardVertical';
import { ArticleHeadline } from '@/features/article/components/ArticleHeadline/ArticleHeadline';
import { ArrowLink } from '@/components/ui/ArrowLink/ArrowLink';
import { UkraineFlagIcon } from '@/components/icons/UkraineFlagIcon';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

type Props = {
  articles: ArticleListItem[];
};

export const WarInUkraineSection: React.FC<Props> = ({ articles }) => {
  const [featured, ...rest] = articles;

  return (
    <section className={styles.ukraine} aria-labelledby='war-in-ukraine-title'>
      <div className={styles.ukraine__top}>
        <div className={styles.ukraine__heading}>
          <h2 id='war-in-ukraine-title' className={styles.ukraine__title}>
            <UkraineFlagIcon className={styles.ukraine__flag} />
            War in Ukraine
          </h2>
          <p className={styles.ukraine__subtitle}>— ongoing coverage</p>
        </div>

        {articles.length > 0 && (
          <ArrowLink
            href='/news/ukraine'
            aria-label='View full coverage of the war in Ukraine'
          >
            View full coverage
          </ArrowLink>
        )}
      </div>

      {featured ? (
        <div className={styles.ukraine__content}>
          <ArticleCardVertical article={featured} />

          {rest.length > 0 && (
            <div className={styles.ukraine__latest}>
              <h3 className={styles.ukraine__latestTitle}>Latest updates</h3>
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
      ) : (
        <EmptyState
          title='No news to show right now'
          description='Please check back a little later.'
        />
      )}
    </section>
  );
};
