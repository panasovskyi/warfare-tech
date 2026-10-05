import { articleApi } from '@/features/article/article.api';
import {
  ArticleCategory,
  type ArticleDetails,
} from '@/features/article/article.types';
import { ApiError } from '@/lib/api/api-error';
import { notFound } from 'next/navigation';
import styles from './ArticleDetails.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLink } from '@/components/ui/ArrowLink/ArrowLink';
import { ExternalLinkIcon } from '@/components/icons/ExternalLinkIcon';
import { RelativeTime } from '@/components/ui/RelativeTime/RelativeTime';
import { SectionBreadcrumbs } from '@/features/article/components/SectionBreadcrumbs/SectionBreadcrumbs';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import {
  NEWS_SECTIONS,
  SECTION_ICONS,
  SubcategoryKey,
} from '@/features/article/article.constants';
import { getSectionTagAndLink } from '@/features/article/article.utils';
import { ArticleHeadline } from '@/features/article/components/ArticleHeadline/ArticleHeadline';

type Props = {
  params: Promise<{ slug: string }>;
};

const getArticleOrNotFound = async (slug: string): Promise<ArticleDetails> => {
  try {
    return await articleApi.getArticleBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
      notFound();
    }

    throw err;
  }
};

// TODO: generateMetadata — title, description, openGraph з mainPicture (зараз на всіх
// сторінках "Create Next App"). Брати статтю через getArticleOrNotFound: fetch у межах
// одного рендера мемоізується, запит буде один. Кешування — як на головній (TODO в app/page.tsx)
export default async function ArticleDetailsPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleOrNotFound(slug);
  // TODO: лонгріди — окремий роут (/longreads/[slug]) чи цей? Якщо окремий: звіряти
  // article.category і permanentRedirect на правильну адресу (див. TODO про getArticlePath у картках)
  const { href, sectionLabel, section } = getSectionTagAndLink(article);
  const sectionArticlesFilter =
    section === 'longread'
      ? { category: ArticleCategory.LONGREAD }
      : section === 'news'
        ? {category: ArticleCategory.NEWS }
        : NEWS_SECTIONS[section].filter;
  
  // TODO: якщо цей запит упаде, впаде вся сторінка (error.tsx замість статті), і стаття
  // ще й чекає на нього. Варіанти:
  // 1) try/catch тут: залогувати помилку, список порожній — aside просто не покажеться;
  // 2) винести aside в окремий async-компонент у <Suspense>: стаття показується одразу,
  //    список догружається, помилку компонент обробляє сам
  const latestNewsResponse = await articleApi.getArticles({ ...sectionArticlesFilter, limit: 10 });
  const latestNews = latestNewsResponse.items.filter(item => item.id !== article.id);
  // TODO: <SectionIcon section={section} /> замість SECTION_ICONS: дублює вибір іконки, а
  // ukraine зараз без прапора в aside (те саме в SectionBreadcrumbs) — чи потрібен там прапор?
  const SectionIcon =
      section in SECTION_ICONS ? SECTION_ICONS[section as SubcategoryKey] : null;

  return (
    <article className={styles.page}>
      <div className={`container ${styles.page__inner}`}>
        <header className={styles.page__header}>
          <SectionBreadcrumbs section={section} />
          <h1 className={styles.page__title}>{article.title}</h1>
          <p className={styles.page__description}>{article.description}</p>
          {/* TODO: сторінки /authors/[login] ще немає — обидва посилання на автора (тут і в картці
              внизу) ведуть на 404, як і в ArticleByline на всіх картках */}
          <div className={styles.author}>
            <Avatar
              name={article.author.fullName}
              size='m'
              className={styles.author__avatar}
            />
            <Link
              href={`/authors/${article.author.login}`}
              className={styles.author__link}
            >
              {article.author.fullName}
            </Link>
            <RelativeTime
              dateTime={article.createdAt}
              className={styles.author__time}
            />
          </div>
        </header>
        <figure className={styles.page__mainPicWrapper}>
          {/*
            fill: обгортці потрібні position: relative і aspect-ratio (або висота),
            інакше фото розтягнеться на весь екран. preload — це найбільший елемент першого екрана.
            alt порожній, бо опису фото в даних немає.
            TODO: поля на сервері для опису фото (alt) і підпису з автором/джерелом фото
            (figcaption) — для новинного сайту підпис потрібен ще й через права на фото
          */}
          <Image
            src={article.mainPicture}
            alt=''
            fill
            preload
            sizes='(min-width: 1528px) 1400px, calc(100vw - 128px)'
            className={styles.page__mainPic}
          />
        </figure>
        <div className={styles.page__content}>
          {/*
            TODO: формат body — абзаци (<p> за порожніми рядками) чи Markdown. Поки переноси
            зберігає white-space: pre-line у стилях, але це один блок, а не абзаци
          */}
          <div className={styles.body}>{article.body}</div>
          {latestNews.length > 0 && (
            <aside
              className={styles.aside}
              aria-labelledby='section-latest-title'
              data-section={section}
            >
              <h2 id='section-latest-title' className={styles.aside__title}>
                {SectionIcon && <SectionIcon className={styles.aside__icon} />}
                Latest in {sectionLabel}
              </h2>

              <ul className={styles.aside__list}>
                {latestNews.map((item) => (
                  <li key={item.id} className={styles.aside__item}>
                    <ArticleHeadline article={item} />
                  </li>
                ))}
              </ul>

              <ArrowLink
                href={href}
                className={styles.aside__link}
                aria-label={`View all in ${sectionLabel}`}
              >
                View all
              </ArrowLink>
            </aside>
          )}
        </div>
        <footer className={styles.page__footer}>
          {/* TODO: теги — посилання на сторінку тегу, коли вона з'явиться (у макеті це посилання) */}
          {article.tags.length > 0 && (
            <ul className={styles.tags} aria-label='Tags'>
              {article.tags.map((tag) => (
                <li key={tag} className={styles.tags__item}>
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {article.source && article.sourceLink && (
            <p className={styles.source}>
              Originally posted by{' '}
              <a
                href={article.sourceLink}
                className={styles.source__link}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`${article.source} (opens in a new tab)`}
              >
                {article.source}
                <ExternalLinkIcon />
              </a>
            </p>
          )}
          <div className={styles.writer}>
            <Avatar
              name={article.author.fullName}
              size='l'
              className={styles.writer__avatar}
            />
            <div className={styles.writer__name}>
              <span>Written by</span>
              <span>{article.author.fullName}</span>
            </div>
            <ArrowLink
              href={`/authors/${article.author.login}`}
              className={styles.writer__link}
            >
              More from this author
            </ArrowLink>
          </div>
        </footer>
        {/* TODO: під статтею, найімовірніше, перехід до наступної новини (не форма підписки) — вирішити */}
      </div>
    </article>
  );
}
