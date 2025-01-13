import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export function setupRouterGuards(router: Router) {
  // 白名单路由
  const whiteList = ['/login']

  // 角色路由映射
  const roleRouteMap = {
    teacher: ['/teacher'],
    student: ['/student']
  }

  // 检查路由权限
  const checkRoutePermission = (path: string, role?: 'teacher' | 'student') => {
    if (!role) return false
    return roleRouteMap[role].some(prefix => path.startsWith(prefix))
  }

  router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const token = userStore.token
    const userInfo = userStore.userInfo

    // 白名单路由直接放行
    if (whiteList.includes(to.path)) {
      if (token) {
        // 已登录用户访问登录页，重定向到首页
        next('/')
      } else {
        next()
      }
      return
    }

    // 未登录用户重定向到登录页
    if (!token) {
      ElMessage.warning('请先登录')
      next(`/login?redirect=${to.path}`)
      return
    }

    // 已登录但没有用户信息，尝试获取用户信息
    if (!userInfo) {
      try {
        // 这里应该调用获取用户信息的 API
        // await userStore.getUserInfo()
        // 如果获取失败，清除 token 并重定向到登录页
        next('/login')
        return
      } catch (error) {
        userStore.logout()
        ElMessage.error('获取用户信息失败，请重新登录')
        next('/login')
        return
      }
    }

    // 检查路由权限
    if (to.path === '/') {
      // 首页根据角色重定向
      next(`/${userInfo.role}`)
    } else if (checkRoutePermission(to.path, userInfo.role)) {
      next()
    } else {
      ElMessage.error('无权访问该页面')
      next('/403')
    }
  })

  // 错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败')
  })
}
