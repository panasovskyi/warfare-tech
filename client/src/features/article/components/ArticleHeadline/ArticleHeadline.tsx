import type { ArticleListItem } from '@/features/article/article.types';
import styles from './ArticleHeadline.module.scss';
import Link from 'next/link';
import { RelativeTime } from '@/components/ui/RelativeTime/RelativeTime';

type Props = {
  article: ArticleListItem;
  isShowTime?: boolean;
};

export const ArticleHeadline: React.FC<Props> = ({
  article,
  isShowTime = false,
}) => {
  return (
    <div className={styles.headline}>
      {isShowTime && (
        <RelativeTime
          dateTime={article.createdAt}
          className={styles.headline__time}
        />
      )}

      {/* TODO: адресу брати з getArticlePath: новини — /slug, лонгріди — /longreads/slug */}
      <Link href={`/${article.slug}`} className={styles.headline__link}>
        {article.title}
      </Link>
    </div>
  );
};
