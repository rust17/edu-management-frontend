export const invoiceEndpoints = {
  create: '/invoices', // Create invoice
  send: (id: number) => `/invoices/${id}/send`, // Send invoice
  studentList: '/invoices/student-invoices', // Student invoice list
  studentDetail: (id: number) => `/invoices/student-invoices/${id}`, // Student invoice details
  teacherList: '/invoices/teacher-invoices', // Teacher invoice list
} as const
