export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// undefined is also empty: that's what a result taken from an array by index
// looks like under noUncheckedIndexedAccess
export function getItemsOrEmpty<T>(
  res: PromiseSettledResult<PaginatedResponse<T>> | undefined,
): T[] {
  return res?.status === 'fulfilled' ? res.value.items : [];
}