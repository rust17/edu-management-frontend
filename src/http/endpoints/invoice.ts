export const invoiceEndpoints = {
  student: '/invoices/student-invoices', // 学生账单列表
  studentDetail: (id: number) => `/invoices/student-invoices/${id}`, // 学生的账单详情
  teacher: '/invoices/teacher-invoices' // 教师账单列表
} as const
