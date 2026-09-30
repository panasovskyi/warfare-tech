import Link from 'next/link';
import styles from './HeroSection.module.scss';
import type { ArticleListItem } from '@/features/article/article.types';

type Props = {
  articles: ArticleListItem[];
};

// Головна новина (isFeatured) на всю ширину. Її заголовок — єдиний h1 головної сторінки
export const HeroSection: React.FC<Props> = ({ articles }) => {
  const [featured] = articles;

  if (!featured) return null;

  return (
    <section className={styles.hero} aria-labelledby='hero-title'>
      <div className='container'>
        <article className={styles.hero__article}>
          {/*
            TODO: мітка — не завжди підкатегорія: у воєнної новини це "War in Ukraine".
            Та сама функція "мітка і колір для статті", що й у картках
          */}
          {featured.subcategory && (
            <Link
              href={`/news/${featured.subcategory.toLowerCase()}`}
              className={styles.hero__subcategoryLink}
            >
              {featured.subcategory}
            </Link>
          )}

          <h1 id='hero-title' className={styles.hero__title}>
            <Link href={`/${featured.slug}`} className={styles.hero__titleLink}>
              {featured.title}
            </Link>
          </h1>

          <p className={styles.hero__description}>{featured.description}</p>

          <div className={styles.hero__meta}>
            {/** пара автор + чам з горизонтальної картки, мона потім перевикристсати */}
            <Link
              href={`/authors/${featured.author.login}`}
              className={styles.hero__authorLink}
            >
              {featured.author.fullName}
            </Link>
            <time dateTime={featured.createdAt} className={styles.hero__time}>
              {/* TODO: видимий час — з тієї самої функції форматування в lib/, що й у картках */}
              2h ago
            </time>
          </div>
        </article>
      </div>
    </section>
  );
};
