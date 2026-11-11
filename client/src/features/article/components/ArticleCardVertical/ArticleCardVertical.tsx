import Link from 'next/link';
import type { ArticleListItem } from '@/features/article/article.types';
import styles from './ArticleCardVertical.module.scss';
import Image from 'next/image';
import { RelativeTime } from '@/components/ui/RelativeTime/RelativeTime';
import { ReadingTime } from '@/components/ui/ReadingTime/ReadingTime';

type Props = {
  article: ArticleListItem;
  headingLevel?: 2 | 3 | 4;
  sizes?: string;
};

const DEFAULT_SIZES =
  '(min-width: 1528px) 737px, (min-width: 1024px) calc((100vw - 264px) * 7 / 12), (min-width: 768px) calc(100vw - 128px), calc(100vw - 80px)';

export const ArticleCardVertical: React.FC<Props> = ({
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

      <div className={styles.card__meta}>
        <RelativeTime
          dateTime={article.createdAt}
          className={styles.card__time}
        />
        <ReadingTime
          minutes={article.readingTime}
          className={styles.card__readingTime}
        />
      </div>
    </article>
  );
};
