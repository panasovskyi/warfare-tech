import Link from 'next/link';
import styles from './ArticleCardGrid.module.scss';
import Image from 'next/image';
import type { ArticleListItem } from '@/features/article/article.types';
import { ArticleByline } from '@/features/article/components/ArticleByline/ArticleByline';

type Props = {
  article: ArticleListItem;
  // На сторінці розділу над сіткою видимого h2 немає, тож сторінка передає тут 2
  headingLevel?: 2 | 3 | 4;
  // Ширина фото на сторінці — підказка для next/image, яку версію фото вантажити.
  // Залежить від сітки, в якій стоїть картка: секція з іншою сіткою передає своє значення
  sizes?: string;
};

// За замовчуванням — сітка сторінки розділу: три колонки через 48px, як у
// ArticleCardCompact. 1528px = контейнер 1400 + поля 2 × 64px
const DEFAULT_SIZES = '(min-width: 1528px) 435px, calc((100vw - 224px) / 3)';

// Картка сітки сторінки розділу: фото зверху, заголовок, опис у два рядки, автор і час.
// Без мітки розділу — розділ уже відомий зі сторінки
export const ArticleCardGrid: React.FC<Props> = ({
  article,
  headingLevel = 3,
  sizes = DEFAULT_SIZES,
}) => {
  const Heading = `h${headingLevel}` as const;

  return (
    <article className={styles.card}>
      <div className={styles.card__imageWrapper}>
        <Image
          src={article.mainPicture}
          alt=''
          fill
          sizes={sizes}
          className={styles.card__image}
        />
      </div>

      <Heading className={styles.card__title}>
        {/* TODO: адресу брати з getArticlePath: новини — /slug, лонгріди — /longreads/slug */}
        <Link href={`/${article.slug}`} className={styles.card__link}>
          {article.title}
        </Link>
      </Heading>

      <p className={styles.card__description}>{article.description}</p>

      <ArticleByline
        author={article.author}
        createdAt={article.createdAt}
        className={styles.card__byline}
      />
    </article>
  );
};
