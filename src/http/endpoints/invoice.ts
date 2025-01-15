export const invoiceEndpoints = {
  create: '/invoices', // 创建账单
  send: (id: number) => `/invoices/${id}/send`, // 发送账单
  studentList: '/invoices/student-invoices', // 学生的账单列表
  studentDetail: (id: number) => `/invoices/student-invoices/${id}`, // 学生的账单详情
  teacherList: '/invoices/teacher-invoices', // 教师的账单列表
} as const
