import axios from 'axios';
import { sourceLinkKey } from '../article/source-link';
import type { PublishingConfig } from '../config/publishing.config';
import { toPublishingError } from './errors';

const TIMEOUT_MS = 15_000;
const PAGE_SIZE = 40;
// 400 newest articles: enough for a young site, and a cap on the number of requests
// TODO: коли статей стане понад 400, дублі серед старіших не знайдуться: шукати за
// sourceLink на сервері (фільтр у GET /articles або унікальний індекс у базі)
const MAX_PAGES = 10;

export type PublishedMatch = {
  slug: string;
  title: string;
};

type ListItem = { slug: string; title: string; sourceLink: string | null };
type ListResponse = { items: ListItem[]; totalPages: number };

const keyOrNull = (link: string): string | null => {
  try {
    return sourceLinkKey(link);
  } catch {
    return null;
  }
};

// The server cannot filter by source link (and it is not unique there), so the newest
// published articles are read page by page and compared by the normalized link
export const findPublishedBySourceLink = async (
  { apiBaseUrl }: PublishingConfig,
  link: string,
): Promise<PublishedMatch | null> => {
  const wanted = keyOrNull(link);

  if (!wanted) {
    return null;
  }

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const response = await axios.get<ListResponse>(`${apiBaseUrl}/articles`, {
        params: { page, limit: PAGE_SIZE },
        timeout: TIMEOUT_MS,
      });

      const match = response.data.items.find(
        (item) => item.sourceLink && keyOrNull(item.sourceLink) === wanted,
      );

      if (match) {
        return { slug: match.slug, title: match.title };
      }

      if (page >= response.data.totalPages) {
        break;
      }
    }

    return null;
  } catch (error) {
    throw toPublishingError(error, 'Checking the site for duplicates');
  }
};
