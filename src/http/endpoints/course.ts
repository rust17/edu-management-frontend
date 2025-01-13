export const courseEndpoints = {
  student: '/courses/student-courses', // 学生的课程列表
  studentDetail: (id: number) => `/courses/student-courses/${id}`, // 学生的课程详情
  create: '/courses', // 创建课程
  update: (id: number) => `/courses/${id}`, // 编辑课程
  teacher: '/courses/teacher-courses', // 教师的课程列表
  teacherDetail: (id: number) => `/courses/teacher-courses/${id}` // 教师的课程详情
} as const
