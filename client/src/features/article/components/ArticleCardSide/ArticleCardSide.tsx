import Link from 'next/link';
import styles from './ArticleCardSide.module.scss';
import Image from 'next/image';
import type { ArticleListItem } from '@/features/article/article.types';
import { ArticleByline } from '@/features/article/components/ArticleByline/ArticleByline';
import { getSectionTagAndLink } from '@/features/article/article.utils';

type Props = {
  article: ArticleListItem;
  // На /news у Top stories видимого h2 немає, тож сторінка передає тут 2
  headingLevel?: 2 | 3 | 4;
  // Ширина фото на сторінці — підказка для next/image, яку версію фото вантажити.
  // Залежить від сітки, в якій стоїть картка: секція з іншою сіткою передає своє значення
  sizes?: string;
};

// За замовчуванням — Top stories на /news: колонка 1fr із 2.55fr без проміжку між
// колонками (40px), полів панелі (2 × 40px) і полів сторінки (2 × 64px).
// 1528px = контейнер 1400 + поля
const DEFAULT_SIZES = '(min-width: 1528px) 502px, calc((100vw - 248px) / 2.55)';

// Середня картка: широке фото зверху, мітка, заголовок, автор і час, без опису.
// Друга й третя новини в Top stories на /news
export const ArticleCardSide: React.FC<Props> = ({
  article,
  headingLevel = 3,
  sizes = DEFAULT_SIZES,
}) => {
  const Heading = `h${headingLevel}` as const;

  const { label, href, section } = getSectionTagAndLink(article);

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

      <Link
        href={href}
        className={styles.card__subcategory}
        data-section={section}
      >
        {label}
      </Link>

      <Heading className={styles.card__title}>
        {/* TODO: адресу брати з getArticlePath: новини — /slug, лонгріди — /longreads/slug */}
        <Link href={`/${article.slug}`} className={styles.card__link}>
          {article.title}
        </Link>
      </Heading>

      <ArticleByline
        author={article.author}
        createdAt={article.createdAt}
        className={styles.card__byline}
      />
    </article>
  );
};
