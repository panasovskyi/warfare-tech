// Envelope of paginated endpoints — mirrors server/src/types/pagination.ts
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
