import Link from 'next/link';
import styles from './ArticleByline.module.scss';
import { ArticleAuthor } from '@/features/article/article.types';
import { RelativeTime } from '@/components/ui/RelativeTime/RelativeTime';

type Props = {
  author: ArticleAuthor;
  createdAt: string;
  className?: string;
};

export const ArticleByline: React.FC<Props> = ({
  author,
  createdAt,
  className,
}) => {
  return (
    <div
      className={className ? `${styles.byline} ${className}` : styles.byline}
    >
      <Link
        href={`/authors/${author.login}`}
        className={styles.byline__authorLink}
      >
        {author.fullName}
      </Link>
      <RelativeTime dateTime={createdAt} />
    </div>
  );
};
