import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { LOGIN_FAILED, SUCCESS } from './codes'

// Create axios instance
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token

    // Add token to header if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response) => {
    const { code, message } = response.data

    // Handle non-success business codes
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

      // Handle common HTTP status codes
      switch (status) {
        case 401:
          // Two cases: 1. Login failed 2. Token expired or invalid. Check by code
          if (data.code === LOGIN_FAILED && data.message) {
            ElMessage.error(data.message)
          } else {
            // Token expired or invalid, clear user info and redirect to login
            userStore.logout()
            window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error(data.message ? data.message : 'No permission for this operation')
          break
        case 404:
          ElMessage.error(data.message ? data.message : 'Requested resource not found')
          break
        case 422:
          // Form validation error, show specific error message
          if (data.message) {
            ElMessage.error(data.message)
          }
          break
        case 500:
          ElMessage.error(data.message ? data.message : 'Server error, please try again later')
          break
        default:
          ElMessage.error('Network error, please try again later')
      }
    } else if (error.request) {
      ElMessage.error('Network connection failed, please check your network')
    } else {
      ElMessage.error('Request failed, please try again later')
    }

    return Promise.reject(error)
  }
)

export default request
