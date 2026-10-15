import Link from 'next/link';
import styles from './ArticleByline.module.scss';
import { ArticleAuthor } from '@/features/article/article.types';
import { getAuthorPath } from '@/features/article/article.utils';
import { RelativeTime } from '@/components/ui/RelativeTime/RelativeTime';
import { ReadingTime } from '@/components/ui/ReadingTime/ReadingTime';

type Props = {
  author: ArticleAuthor;
  createdAt: string;
  className?: string;
  readingTime: number;
};

export const ArticleByline: React.FC<Props> = ({
  author,
  createdAt,
  className,
  readingTime,
}) => {
  return (
    <div
      className={className ? `${styles.byline} ${className}` : styles.byline}
    >
      <Link
        href={getAuthorPath(author.login)}
        className={styles.byline__authorLink}
      >
        {author.fullName}
      </Link>
      <div className={styles.byline__meta}>
        <RelativeTime dateTime={createdAt} className={styles.byline__time} />
        <ReadingTime
          minutes={readingTime}
          className={styles.byline__readingTime}
        />
      </div>
    </div>
  );
};
