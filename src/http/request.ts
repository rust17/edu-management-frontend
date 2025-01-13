import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { LOGIN_FAILED, SUCCESS } from './codes'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token

    // 如果有 token 则带上
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, message } = response.data

    // 如果业务状态码不为 0，统一处理错误
    if (code !== SUCCESS && message) {
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }

    return response
  },
  (error) => {
    const userStore = useUserStore()

    if (error.response) {
      const { status, data } = error.response

      // 处理常见的 HTTP 状态码
      switch (status) {
        case 401:
          // 分两种情况：1. 登录失败 2. token 过期或无效。根据 code 来判断
          if (data.code === LOGIN_FAILED && data.message) {
            ElMessage.error(data.message)
          } else {
            // token 过期或无效，清除用户信息并跳转到登录页
            userStore.logout()
            window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error('没有权限进行此操作')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 422:
          // 表单验证错误，显示具体的错误信息
          if (data.message) {
            ElMessage.error(data.message)
          }
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error('网络错误，请稍后重试')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求失败，请稍后重试')
    }

    return Promise.reject(error)
  }
)

export default request
