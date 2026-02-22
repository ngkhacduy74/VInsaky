export type PaginationResponse<T> = {
  items: T[];
  total: number;
  skip: number;
  limit: number;
};
