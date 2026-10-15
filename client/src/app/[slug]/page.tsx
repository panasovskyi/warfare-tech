import type { Metadata } from 'next';
import { articleApi } from '@/features/article/article.api';
import { type ArticleDetails } from '@/features/article/article.types';
import { ApiError } from '@/lib/api/api-error';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import styles from './ArticleDetails.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLink } from '@/components/ui/ArrowLink/ArrowLink';
import { ExternalLinkIcon } from '@/components/icons/ExternalLinkIcon';
import { RelativeTime } from '@/components/ui/RelativeTime/RelativeTime';
import { SectionBreadcrumbs } from '@/features/article/components/SectionBreadcrumbs/SectionBreadcrumbs';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import {
  getAuthorPath,
  getSectionTagAndLink,
} from '@/features/article/article.utils';
import { ArticleBody } from '@/features/article/components/ArticleBody/ArticleBody';
import { AsideSection } from './_components/AsideSection/AsideSection';

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleOrNotFound(slug);
  const { sectionLabel } = getSectionTagAndLink(article);

  return {
    title: article.title,
    description: article.description,
    authors: [{ name: article.author.fullName }],
    openGraph: {
      type: 'article',
      siteName: 'Warfare Tech',
      locale: 'en_US',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      section: sectionLabel,
      tags: article.tags,
      // alt поки заголовок статті: опису фото в даних немає (TODO про photoAlt у schema.prisma)
      images: [{ url: article.mainPicture, alt: article.title }],
    },
  };
}

// TODO: кешування сторінки статті. Зараз її не кешуємо взагалі: динамічний маршрут без
// generateStaticParams рендериться на кожен запит. Потрібні export const revalidate = N
// (5–15 хв: статті не змінюються, оновлюються лише aside і "3 hours ago") і
// generateStaticParams, що повертає [] (інакше ISR у рантаймі не працює). Перевірити, що
// generateMetadata і сторінка кешуються разом. loading.tsx тут не додавати: [slug] ловить
// невідомі адреси, і з ним їхній статус 404 став би 200. Решта — як на головній (TODO в
// app/page.tsx)
export default async function ArticleDetailsPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleOrNotFound(slug);
  const { section } = getSectionTagAndLink(article);

  return (
    <article className={styles.page}>
      <div className={`container ${styles.page__inner}`}>
        <header className={styles.page__header}>
          <SectionBreadcrumbs section={section} />
          <h1 className={styles.page__title}>{article.title}</h1>
          <p className={styles.page__description}>{article.description}</p>
          <div className={styles.author}>
            <Avatar
              name={article.author.fullName}
              size='m'
              className={styles.author__avatar}
            />
            <Link
              href={getAuthorPath(article.author.login)}
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
            TODO: поле на сервері для опису фото (alt)
          */}
          <Image
            src={article.mainPicture}
            alt=''
            fill
            preload
            sizes='(min-width: 1528px) 1400px, (min-width: 1024px) calc(100vw - 128px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)'
            className={styles.page__mainPic}
          />
          {article.photoCredit && (
            <figcaption className={styles.page__mainPicCredit}>
              Photo: {article.photoCredit}
            </figcaption>
          )}
        </figure>
        <div className={styles.page__content}>
          <ArticleBody body={article.body} />
          <Suspense fallback={null}>
            <AsideSection section={section} articleId={article.id} />
          </Suspense>
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
              href={getAuthorPath(article.author.login)}
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
