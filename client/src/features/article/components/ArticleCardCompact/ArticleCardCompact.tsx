import Link from 'next/link';
import type { ArticleListItem } from '@/features/article/article.types';
import styles from './ArticleCardCompact.module.scss';
import Image from 'next/image';

type Props = {
  article: ArticleListItem;
  headingLevel?: 2 | 3 | 4;
  sizes?: string;
};

const DEFAULT_SIZES =
  '(min-width: 1528px) 435px, (min-width: 1024px) calc((100vw - 224px) / 3), (min-width: 640px) calc((100vw - 96px) / 2), calc(100vw - 40px)';

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
