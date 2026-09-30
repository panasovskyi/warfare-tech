import { articleApi } from '@/features/article/article.api';
import type { ArticleDetails } from '@/features/article/article.types';
import { ApiError } from '@/lib/api/api-error';
import { notFound } from 'next/navigation';
import styles from './ArticleDetails.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';
import { ExternalLinkIcon } from '@/components/icons/ExternalLinkIcon';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetailsPage({ params }: Props) {
  const { slug } = await params;
  let article: ArticleDetails;
  // TODO: винести try/catch у функцію на кшталт getArticleOrNotFound(slug) над сторінкою —
  // той самий запит з тією ж обробкою потрібен у generateMetadata. Тоді тут буде один рядок
  // const article = await getArticleOrNotFound(slug), без let і блоку try
  try {
    article = await articleApi.getArticleBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
      notFound();
    }

    throw err;
  }

  return (
    <article className={styles.page}>
      <header className={styles.page__header}>
        {/*
          TODO: хлібні крихти → nav aria-label="Breadcrumb" зі списком ol/li: News › Air
          (/news, /news/air); для воєнної новини — News › War in Ukraine.
          Підпис — з тієї самої функції "мітка і колір статті", що й у картках
        */}
        <Link href={'/'} className={styles.page__breadcrumbs}>
          ТУТ БУДЕ ТИПУ УКРАЇНА ЧИ КАТЕГОРІЯ ЧИ ЛОНГРІД
        </Link>
        <h1 className={styles.page__title}>{article.title}</h1>
        <p className={styles.page__description}>{article.description}</p>

        <div className={styles.author}>
          <div className={styles.author__avatar}>
            {/**колись вствимо автар а поки сиуляція перших двох букв чи перших букв ПІБ */}
            {/* TODO: аватар з ініціалами декоративний (ім'я стоїть поруч) → aria-hidden.
                Ініціали з fullName — маленька функція в lib/ */}
          </div>
          {/** у нас вже є елементи автор + час але без автара і інший дизайн
           * подумати чи можна обєднати
           */}
          <Link
            href={`/authors/${article.author.login}`}
            className={styles.author__link}
          >
            {article.author.fullName}
          </Link>
          <time dateTime={article.createdAt} className={styles.author__time}>
            {/* TODO: видимий час — з тієї самої функції форматування в lib/, що й у картках */}
            2h ago
          </time>
        </div>
      </header>

      <figure className={styles.page__mainPicWrapper}>
        {/*
          fill: обгортці потрібні position: relative і aspect-ratio (або висота),
          інакше фото розтягнеться на весь екран. preload — це найбільший елемент першого екрана.
          alt порожній, бо опису фото в даних немає; згодом — окреме поле на сервері
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
        <div className={styles.body}>{article.body}</div>
        <aside className={styles.aside}>{/** тут над подумать */}</aside>
      </div>

      <footer className={styles.page__footer}>
        {article.tags.length > 0 && (
          <ul className={styles.tags} aria-label='Tags'>
            {article.tags.map((tag) => (
              <li key={tag} className={styles.tags__item}>
                {tag}
              </li>
            ))}
          </ul>
        )}

        {/*
          TODO: source і sourceLink можуть бути null — рендерити блок лише тоді, коли є обидва.
          Між "Originally posted by" і посиланням бракує пробілу ({' '}): JSX прибирає перенос рядка.
          Зовнішнє посилання — звичайний <a> (для нової вкладки — з rel="noopener noreferrer"),
          шаблонний рядок навколо sourceLink зайвий.
          Якщо буде target="_blank" — додати aria-label на кшталт "{source} (opens in a new tab)":
          іконка aria-hidden, тож без цього скрінрідер не дізнається про нову вкладку
        */}
        <div className={styles.source}>
          Originally posted by ({' '})
          <Link href={`${article.sourceLink}`} className={styles.source__link}>
            {article.source}
            <ExternalLinkIcon />
          </Link>
        </div>

        <div className={styles.writer}>
          <div className={styles.writer__avatar}>
            {/**колись вствимо автар а поки сиуляція перших двох букв чи перших букв ПІБ */}
            {/* TODO: так само aria-hidden і ініціали з тієї ж функції, що й аватар угорі */}
          </div>

          <div className={styles.writer__name}>
            <span>Written by</span>
            <span>{article.author.fullName}</span>
          </div>

          <Link
            href={`/authors/${article.author.login}`}
            className={styles.writer__link}
          >
            More from this author <ArrowRightIcon />
          </Link>
        </div>
      </footer>

      {/** додамо форму підписки на новини */}
    </article>
  );
}
