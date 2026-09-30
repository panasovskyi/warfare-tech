import Link from 'next/link';
import type { ArticleListItem } from '@/features/article/article.types';
import styles from './ArticleCardCompact.module.scss';
import Image from 'next/image';

type Props = {
  article: ArticleListItem;
  // Рівень заголовка залежить від місця: під h2 блоку картка — h3
  headingLevel?: 2 | 3 | 4;
};

// Фото і заголовок, без мітки й мети. Перша новина в SubcategorySection, картки SpecialReportSection
export const ArticleCardCompact: React.FC<Props> = ({
  article,
  headingLevel = 3,
}) => {
  const Heading = `h${headingLevel}` as const;

  return (
    <article className={styles.card}>
      <div className={styles.card__imageWrapper}>
        {/*
          TODO: fill уже є; ще потрібні sizes (без нього Next підставляє 100vw і вантажить
          фото на всю ширину екрана) і стилі обгортки: position: relative, aspect-ratio,
          overflow: hidden; на Image — object-fit: cover.
          TODO: remotePatterns зараз лише для тестового placehold.co. Краще, щоб ingestion
          завантажував фото в Cloudinary: тоді в конфігу один хост, і фото не зникнуть разом із джерелом
        */}
        <Image src={article.mainPicture} alt='' fill />
      </div>

      <Heading className={styles.card__title}>
        {/*
          Як у Horizontal: посилання лише на заголовку, його ::after розтягується
          на всю картку (position: absolute; inset: 0), у .card — position: relative.
          Інших посилань у цій картці немає, тож z-index не знадобиться.
          TODO: адресу брати з getArticlePath: новини — /slug, лонгріди — /longreads/slug
        */}
        <Link href={`/${article.slug}`} className={styles.card__link}>
          {article.title}
        </Link>
      </Heading>
    </article>
  );
};
