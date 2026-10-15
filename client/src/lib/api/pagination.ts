export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function getItemsOrEmpty<T>(
  res: PromiseSettledResult<PaginatedResponse<T>> | undefined,
): T[] {
  return res?.status === 'fulfilled' ? res.value.items : [];
}

const MAX_PAGE = 999;

export const getPageNumber = (page: string | string[] | undefined): number => {
  const pageNumber = typeof page === 'string' ? Number(page) : NaN;

  return Number.isInteger(pageNumber) &&
    pageNumber >= 1 &&
    pageNumber <= MAX_PAGE
    ? pageNumber
    : 1;
};