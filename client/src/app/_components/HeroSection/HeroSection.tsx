import Link from 'next/link';
import Image from 'next/image';
import styles from './HeroSection.module.scss';
import {
  ArticleListItem,
} from '@/features/article/article.types';
import { getSectionTagAndLink } from '@/features/article/article.utils';
import { ArticleByline } from '@/features/article/components/ArticleByline/ArticleByline';

type Props = {
  articles: ArticleListItem[];
};

export const HeroSection: React.FC<Props> = ({ articles }) => {
  const [featured] = articles;

  if (!featured) return null;

  const { label, href, section } = getSectionTagAndLink(featured);

  return (
    <section className={styles.hero} aria-labelledby='hero-title'>
      <div className='container'>
        <article className={styles.hero__article}>
          <Image
            src={featured.mainPicture}
            alt=''
            fill
            preload
            sizes='(min-width: 1528px) 1400px, calc(100vw - 128px)'
            className={styles.hero__image}
          />
          {/* data-section — за ним стилі беруть колір плашки мітки */}
          <Link
            href={href}
            className={styles.hero__subcategoryLink}
            data-section={section}
          >
            {label}
          </Link>

          <h1 id='hero-title' className={styles.hero__title}>
            <Link href={`/${featured.slug}`} className={styles.hero__titleLink}>
              {featured.title}
            </Link>
          </h1>

          <p className={styles.hero__description}>{featured.description}</p>

          <ArticleByline
            author={featured.author}
            createdAt={featured.createdAt}
            className={styles.hero__byline}
          />
        </article>
      </div>
    </section>
  );
};
