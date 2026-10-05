import Link from 'next/link';
import styles from './ArticleCardRow.module.scss';
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

// Мініатюра має фіксовану ширину, тож і sizes фіксований
const DEFAULT_SIZES = '240px';

// Рядок списку: мініатюра зліва, справа мітка, заголовок, опис, автор і час.
// Список Latest на /news. Межі й відступи між рядками задає список
export const ArticleCardRow: React.FC<Props> = ({
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

        <p className={styles.card__description}>{article.description}</p>

        <ArticleByline
          author={article.author}
          createdAt={article.createdAt}
          className={styles.card__byline}
        />
      </div>
    </article>
  );
};
