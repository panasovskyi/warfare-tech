import Link from 'next/link';
import styles from './ArticleCardHorizontal.module.scss';
import Image from 'next/image';
import type { ArticleListItem } from '@/features/article/article.types';
import { ArticleByline } from '@/features/article/components/ArticleByline/ArticleByline';
import { getSectionTagAndLink } from '@/features/article/article.utils';

type Props = {
  article: ArticleListItem;
  // Рівень заголовка залежить від місця: під h2 блоку картка — h3
  headingLevel?: 2 | 3 | 4;
  // Ширина фото на сторінці — підказка для next/image, яку версію фото вантажити.
  // Залежить від сітки, в якій стоїть картка: секція з іншою сіткою передає своє значення
  sizes?: string;
};

// За замовчуванням — Latest: дві колонки через 48px, мініатюра — третина картки
// без проміжку 20px. 1528px = контейнер 1400 + поля 2 × 64. Від 768px поля 32, нижче одна
// колонка з полями 20
const DEFAULT_SIZES =
  '(min-width: 1528px) 220px, (min-width: 1024px) calc((100vw - 216px) / 6), (min-width: 768px) calc((100vw - 152px) / 6), calc((100vw - 60px) / 3)';

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
        
          <Link href={`/${article.slug}`} className={styles.card__link}>
            {article.title}
          </Link>
        </Heading>
        <ArticleByline
          readingTime={article.readingTime}
          author={article.author}
          createdAt={article.createdAt}
          className={styles.card__byline}
        />
      </div>
    </article>
  );
};
