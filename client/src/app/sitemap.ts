import type { MetadataRoute } from 'next';
import { articleApi } from '@/features/article/article.api';
import { NEWS_SECTIONS } from '@/features/article/article.constants';
import type { ArticleListItem } from '@/features/article/article.types';
import { getAuthorPath } from '@/features/article/article.utils';
import { SITE_URL } from '@/lib/links';

const PAGE_SIZE = 40;
const MAX_PAGES = 50;

const STATIC_PATHS = ['/', '/news', '/about', '/contact'];

const getAllArticles = async (): Promise<ArticleListItem[]> => {
  const articles: ArticleListItem[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { items, totalPages } = await articleApi.getArticles({
      limit: PAGE_SIZE,
      page,
    });

    articles.push(...items);

    if (page >= totalPages) {
      break;
    }
  }

  return articles;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();
  const newestDate = articles[0]?.updatedAt;

  const staticPages: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
  }));

  const sectionPages: MetadataRoute.Sitemap = Object.keys(NEWS_SECTIONS).map(
    (section) => ({
      url: `${SITE_URL}/news/${section}`,
      lastModified: newestDate,
    }),
  );

  const authorLogins = new Set(articles.map((article) => article.author.login));
  const authorPages: MetadataRoute.Sitemap = [...authorLogins].map((login) => ({
    url: `${SITE_URL}${getAuthorPath(login)}`,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/${article.slug}`,
    lastModified: article.updatedAt,
  }));

  return [...staticPages, ...sectionPages, ...authorPages, ...articlePages];
}
