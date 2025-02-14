import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export function setupRouterGuards(router: Router) {
  // Whitelist routes
  const whiteList = ['/login']

  // Role route mapping
  const roleRouteMap = {
    teacher: ['/teacher'],
    student: ['/student']
  }

  // Check route permission
  const checkRoutePermission = (path: string, role?: 'teacher' | 'student') => {
    if (!role) return false
    return roleRouteMap[role].some(prefix => path.startsWith(prefix))
  }

  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = userStore.token
    const userInfo = userStore.userInfo

    // Whitelist routes are allowed directly
    if (whiteList.includes(to.path)) {
      if (token) {
        // Redirect logged-in users to home page when accessing login page
        next('/')
      } else {
        next()
      }
      return
    }

    // Redirect unauthenticated users to login page
    if (!token) {
      ElMessage.warning('Please login first')
      next(`/login?redirect=${to.path}`)
      return
    }

    // If logged in but no user info, try to get user info
    if (!userInfo) {
      try {
        // Here should call the API to get user info
        // await userStore.getUserInfo()
        // If failed, clear token and redirect to login page
        next('/login')
        return
      } catch (error) {
        userStore.logout()
        ElMessage.error('Failed to get user info, please login again')
        next('/login')
        return
      }
    }

    // Check route permission
    if (to.path === '/') {
      // Redirect to home page based on role
      next(`/${userInfo.role}`)
    } else if (checkRoutePermission(to.path, userInfo.role)) {
      next()
    } else {
      ElMessage.error('No permission to access this page')
      next('/403')
    }
  })

  // Error handling
  router.onError((error) => {
    console.error('Route error:', error)
    ElMessage.error('Page load failed')
  })
}
