export type PageParams = { page?: number; pageSize?: number };
export const getPagination = (q: PageParams) => {
  const page = q.page && q.page > 0 ? q.page : 1;
  const pageSize = q.pageSize && q.pageSize > 0 && q.pageSize <= 100 ? q.pageSize : 20;
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { page, pageSize, skip, take };
};

