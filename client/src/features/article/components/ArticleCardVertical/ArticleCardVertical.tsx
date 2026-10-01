import Link from 'next/link';
import type { ArticleListItem } from '@/features/article/article.types';
import styles from './ArticleCardVertical.module.scss';
import Image from 'next/image';
import { RelativeTime } from '@/components/ui/RelativeTime/RelativeTime';

type Props = {
  article: ArticleListItem;
  // Рівень заголовка залежить від місця: під h2 блоку картка — h3
  headingLevel?: 2 | 3 | 4;
  // Ширина фото на сторінці — підказка для next/image, яку версію фото вантажити.
  // Залежить від сітки, в якій стоїть картка: секція з іншою сіткою передає своє значення
  sizes?: string;
};

// За замовчуванням — головна новина War in Ukraine: 7/12 панелі без її полів (2 × 48px)
// і проміжку між колонками (40px). 1528px = контейнер 1400 + поля сторінки 2 × 64
const DEFAULT_SIZES =
  '(min-width: 1528px) 737px, calc((100vw - 264px) * 7 / 12)';

// Фото зверху, заголовок, опис і час. Головна новина у WarInUkraineSection
export const ArticleCardVertical: React.FC<Props> = ({
  article,
  headingLevel = 3,
  sizes = DEFAULT_SIZES,
}) => {
  const Heading = `h${headingLevel}` as const;

  return (
    <article className={styles.card}>
      <div className={styles.card__imageWrapper}>
        {/*
          TODO: remotePatterns зараз лише для тестового placehold.co. Краще, щоб ingestion
          завантажував фото в Cloudinary: тоді в конфігу один хост, і фото не зникнуть разом із джерелом
        */}
        <Image
          src={article.mainPicture}
          alt=''
          fill
          sizes={sizes}
          className={styles.card__image}
        />
      </div>

      <Heading className={styles.card__title}>
        {/*
          Як у Horizontal: посилання лише на заголовку, його ::after розтягується
          на всю картку (position: absolute; inset: 0), у .card — position: relative.
          Інших посилань у цій картці немає, тож z-index не знадобиться.
          TODO: адресу брати з getArticlePath: новини — /slug, лонгріди — /longreads/slug
        */}
        <Link href={`/${article.slug}`} className={styles.card__link}>
          {article.title}
        </Link>
      </Heading>

      <p className={styles.card__description}>{article.description}</p>

      <RelativeTime
        dateTime={article.createdAt}
        className={styles.card__time}
      />
    </article>
  );
};
