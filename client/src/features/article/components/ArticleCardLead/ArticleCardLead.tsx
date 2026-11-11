import Link from 'next/link';
import styles from './ArticleCardLead.module.scss';
import Image from 'next/image';
import type { ArticleListItem } from '@/features/article/article.types';
import { ArticleByline } from '@/features/article/components/ArticleByline/ArticleByline';
import { getSectionTagAndLink } from '@/features/article/article.utils';

type Props = {
  article: ArticleListItem;
  headingLevel?: 2 | 3 | 4;
  sizes?: string;
  preload?: boolean;
};

const DEFAULT_SIZES =
  '(min-width: 1528px) 779px, (min-width: 1024px) calc((100vw - 248px) * 1.55 / 2.55), (min-width: 768px) calc(100vw - 112px), calc(100vw - 80px)';

export const ArticleCardLead: React.FC<Props> = ({
  article,
  headingLevel = 3,
  sizes = DEFAULT_SIZES,
  preload = false,
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
          preload={preload}
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
