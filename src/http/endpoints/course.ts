export const courseEndpoints = {
  student: '/courses/student-courses', // Student course list
  studentDetail: (id: number) => `/courses/student-courses/${id}`, // Student course details
  create: '/courses', // Create course
  update: (id: number) => `/courses/${id}`, // Update course
  teacher: '/courses/teacher-courses', // Teacher course list
  teacherDetail: (id: number) => `/courses/teacher-courses/${id}` // Teacher course details
} as const
