import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import styles from './AuthorPage.module.scss';
import { authorApi } from '@/features/author/author.api';
import type { AuthorProfile } from '@/features/author/author.types';
import type { ArticleListItem } from '@/features/article/article.types';
import { ArticleCardRow } from '@/features/article/components/ArticleCardRow/ArticleCardRow';
import { ApiError } from '@/lib/api/api-error';
import { formatMonthYear } from '@/lib/date';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { ArrowLink } from '@/components/ui/ArrowLink/ArrowLink';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

type Props = {
  params: Promise<{ login: string }>;
};

const getAuthorOrNotFound = async (
  loginParam: string,
): Promise<AuthorProfile> => {
  try {
    return await authorApi.getProfile(decodeURIComponent(loginParam));
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
      notFound();
    }

    throw err;
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { login } = await params;
  const author = await getAuthorOrNotFound(login);

  return {
    title: author.fullName,
    description: `Latest articles by ${author.fullName} on Warfare Tech.`,
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function AuthorPage({ params }: Props) {
  const { login } = await params;
  const profile = await getAuthorOrNotFound(login);

  // TODO: профіль віддає лише 10 останніх статей автора. Для пагінації чи посилання «всі статті»
  // потрібен фільтр за автором у GET /articles на сервері

  const author = { login: profile.login, fullName: profile.fullName };
  const articles: ArticleListItem[] = profile.articles.map((article) => ({
    ...article,
    author,
  }));

  const since = formatMonthYear(profile.createdAt);

  return (
    <div className={styles.page}>
      <div className={`container ${styles.page__inner}`}>
        <header className={styles.profile}>
          <Avatar name={profile.fullName} size='xl' />
          <div className={styles.profile__text}>
            <h1 className={styles.profile__name}>{profile.fullName}</h1>
            {since && (
              <p className={styles.profile__meta}>
                Publishing on Warfare Tech since{' '}
                <time dateTime={profile.createdAt}>{since}</time>
              </p>
            )}
            <ArrowLink href='/about' className={styles.profile__link}>
              How the articles are written
            </ArrowLink>
          </div>
        </header>

        <section
          className={styles.articles}
          aria-labelledby='author-articles-title'
        >
          <h2 id='author-articles-title' className={styles.articles__title}>
            Latest articles
          </h2>

          {articles.length === 0 ? (
            <EmptyState
              title='No articles yet'
              description='Published articles by this author will appear here.'
            />
          ) : (
            <ul>
              {articles.map((article) => (
                <li key={article.id} className={styles.articles__item}>
                  <ArticleCardRow article={article} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
