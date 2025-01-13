export const DEFAULT_PAGINATION = () => ({
  currentPage: 1, // 当前页码
  pageSize: 15, // 每页条数
  total: 0 // 总数
})

export type PaginationType = ReturnType<typeof DEFAULT_PAGINATION>
