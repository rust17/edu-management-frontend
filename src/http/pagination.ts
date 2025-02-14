export const DEFAULT_PAGINATION = () => ({
  currentPage: 1, // current page
  pageSize: 15, // page size
  total: 0 // total
})

export type PaginationType = ReturnType<typeof DEFAULT_PAGINATION>
