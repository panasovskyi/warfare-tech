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
      {/*
        TODO: сторінки /authors/[login] ще немає — посилання веде на 404. login на сервері —
        будь-які символи (3–20), тож у href потрібен encodeURIComponent, як для slug в api
      */}
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
