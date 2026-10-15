import Link from 'next/link';
import type { ArticleListItem } from '@/features/article/article.types';
import styles from './ArticleCardCompact.module.scss';
import Image from 'next/image';

type Props = {
  article: ArticleListItem;
  // Рівень заголовка залежить від місця: під h2 блоку картка — h3
  headingLevel?: 2 | 3 | 4;
  // Ширина фото на сторінці — підказка для next/image, яку версію фото вантажити.
  // Залежить від сітки, в якій стоїть картка: секція з іншою сіткою передає своє значення
  sizes?: string;
};

// За замовчуванням — сітка підкатегорій: третина контейнера без двох проміжків по 48px.
// 1528px = контейнер 1400 + поля 2 × 64. Нижче 1024px дві колонки (поля 32, проміжок 32),
// нижче 640px одна (поля 20)
const DEFAULT_SIZES =
  '(min-width: 1528px) 435px, (min-width: 1024px) calc((100vw - 224px) / 3), (min-width: 640px) calc((100vw - 96px) / 2), calc(100vw - 40px)';

// Фото і заголовок, без мітки й мети. Перша новина в SubcategorySection, картки SpecialReportSection
export const ArticleCardCompact: React.FC<Props> = ({
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
        <Link href={`/${article.slug}`} className={styles.card__link}>
          {article.title}
        </Link>
      </Heading>
    </article>
  );
};
