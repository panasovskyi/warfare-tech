import Link from 'next/link';
import styles from './ArticleCardHorizontal.module.scss';
import Image from 'next/image';
import type { ArticleListItem } from '@/features/article/article.types';
import { ArticleByline } from '@/features/article/components/ArticleByline/ArticleByline';
import { getSectionTagAndLink } from '@/features/article/article.utils';

// TODO: поки що сім окремих карток — Horizontal (ця: фото зліва, мітка, заголовок, автор і час),
// Compact, Vertical, Lead, Side, Row і Grid з однаковими пропсами article, headingLevel і sizes
// (у Lead ще preload). Після порівняння — або одна ArticleCard з variant, або тонкі картки зі
// спільних частин (фото, мітка, заголовок-посилання, мета).

type Props = {
  article: ArticleListItem;
  // Рівень заголовка залежить від місця: під h2 блоку картка — h3
  headingLevel?: 2 | 3 | 4;
  // Ширина фото на сторінці — підказка для next/image, яку версію фото вантажити.
  // Залежить від сітки, в якій стоїть картка: секція з іншою сіткою передає своє значення
  sizes?: string;
};

// За замовчуванням — Latest: дві колонки через 48px, мініатюра — третина картки
// без проміжку 20px. 1528px = контейнер 1400 + поля 2 × 64
const DEFAULT_SIZES = '(min-width: 1528px) 220px, calc((100vw - 216px) / 6)';

export const ArticleCardHorizontal: React.FC<Props> = ({
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

      <div className={styles.card__content}>
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
      </div>
    </article>
  );
};
