import Link from 'next/link';
import styles from './ArticleCardGrid.module.scss';
import Image from 'next/image';
import type { ArticleListItem } from '@/features/article/article.types';
import { ArticleByline } from '@/features/article/components/ArticleByline/ArticleByline';

type Props = {
  article: ArticleListItem;
  headingLevel?: 2 | 3 | 4;
  sizes?: string;
};

const DEFAULT_SIZES =
  '(min-width: 1528px) 435px, (min-width: 1024px) calc((100vw - 224px) / 3), (min-width: 640px) calc((100vw - 96px) / 2), calc(100vw - 40px)';

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
        <Link href={`/${article.slug}`} className={styles.card__link}>
          {article.title}
        </Link>
      </Heading>

      <p className={styles.card__description}>{article.description}</p>
      <ArticleByline
        readingTime={article.readingTime}
        author={article.author}
        createdAt={article.createdAt}
        className={styles.card__byline}
      />
    </article>
  );
};
