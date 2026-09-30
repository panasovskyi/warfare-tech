import type { ArticleListItem } from '@/features/article/article.types';
import styles from './ArticleHeadline.module.scss';
import Link from 'next/link';

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
        <time dateTime={article.createdAt} className={styles.headline__time}>
          {/* TODO: видимий час — з тієї самої функції форматування в lib/, що й у картках */}
          2h ago
        </time>
      )}

      {/* TODO: адресу брати з getArticlePath: новини — /slug, лонгріди — /longreads/slug */}
      <Link href={`/${article.slug}`} className={styles.headline__link}>
        {article.title}
      </Link>
    </div>
  );
};
