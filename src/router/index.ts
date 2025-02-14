import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue')
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: () => {
      const userStore = useUserStore()
      const userInfo = userStore.userInfo
      if (userInfo?.role === 'teacher') {
        return '/teacher'
      } else {
        return '/student'
      }
    },
    children: [
      // Teacher routes
      {
        path: '/teacher',
        name: 'TeacherDashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        path: '/teacher/courses',
        name: 'TeacherCourses',
        component: () => import('@/views/teacher/courses/index.vue')
      },
      {
        path: '/teacher/courses/create',
        name: 'TeacherCourseCreate',
        component: () => import('@/views/teacher/courses/create.vue')
      },
      {
        path: '/teacher/courses/:id',
        name: 'TeacherCourseDetail',
        component: () => import('@/views/teacher/courses/detail.vue')
      },
      {
        path: '/teacher/bills',
        name: 'TeacherBills',
        component: () => import('@/views/teacher/bills/index.vue')
      },
      // Student routes
      {
        path: '/student',
        name: 'StudentDashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        path: '/student/courses',
        name: 'StudentCourses',
        component: () => import('@/views/student/courses/index.vue')
      },
      {
        path: '/student/courses/:id',
        name: 'StudentCourseDetail',
        component: () => import('@/views/student/courses/detail.vue')
      },
      {
        path: '/student/bills',
        name: 'StudentBills',
        component: () => import('@/views/student/bills/index.vue')
      },
      {
        path: '/student/bills/:id',
        name: 'StudentBillDetail',
        component: () => import('@/views/student/bills/detail.vue')
      }
    ]
  },
  // Error pages
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('@/views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Setup router guards
setupRouterGuards(router)

export default router
