import Link from 'next/link';
import styles from './ArticleCardHorizontal.module.scss';
import Image from 'next/image';
import type { ArticleListItem } from '@/features/article/article.types';

// TODO: поки що три окремі картки — Horizontal (ця: фото зліва, мітка, заголовок, автор і час),
// Compact і Vertical з однаковими пропсами. Після порівняння — або одна ArticleCard з variant,
// або три тонкі картки зі спільних частин (фото, заголовок-посилання, мета).

type Props = {
  article: ArticleListItem;
  // Рівень заголовка залежить від місця: під h2 блоку картка — h3
  headingLevel?: 2 | 3 | 4;
};

export const ArticleCardHorizontal: React.FC<Props> = ({
  article,
  headingLevel = 3,
}) => {
  const Heading = `h${headingLevel}` as const;

  return (
    <article className={styles.card}>
      <div className={styles.card__imageWrapper}>
        {/*
          TODO: fill уже є; ще потрібні sizes (без нього Next підставляє 100vw і вантажить
          фото на всю ширину екрана) і стилі обгортки: position: relative, aspect-ratio,
          overflow: hidden; на Image — object-fit: cover.
          TODO: remotePatterns зараз лише для тестового placehold.co. Краще, щоб ingestion
          завантажував фото в Cloudinary: тоді в конфігу один хост, і фото не зникнуть разом із джерелом
        */}
        <Image src={article.mainPicture} alt='' fill />
      </div>

      <div className={styles.card__content}>
        {/*
          TODO: мітка — не завжди підкатегорія: у воєнної новини це "War in Ukraine",
          у лонгріда — "Longread". Потрібна функція "мітка і колір для статті" в домені
        */}
        {article.subcategory && (
          <Link
            href={`/news/${article.subcategory.toLowerCase()}`}
            className={styles.card__subcategory}
          >
            {article.subcategory}
          </Link>
        )}

        <Heading className={styles.card__title}>
          {/*
            Посилання на статтю лише на заголовку. Щоб клікабельною була вся картка,
            його ::after розтягується на всю картку (position: absolute; inset: 0),
            а в .card — position: relative. Посилання на розділ і автора отримують
            position: relative і z-index, щоб лишатися клікабельними поверх ::after.
            TODO: адресу брати з getArticlePath: новини — /slug, лонгріди — /longreads/slug
          */}
          <Link href={`/${article.slug}`} className={styles.card__link}>
            {article.title}
          </Link>
        </Heading>

        <div className={styles.card__meta}>
          {/* TODO: author може бути відсутній — статті з профілю приходять без нього */}
          <Link href={`/authors/${article.author.login}`}>
            {article.author.fullName}
          </Link>
          <time dateTime={article.createdAt} className={styles.card__time}>
            1h ago{' '}
            {/**
             * тут як і в решті поібних полів юуде форматування
             */}
          </time>
        </div>
      </div>
    </article>
  );
};
