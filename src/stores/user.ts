import { defineStore } from 'pinia'

interface UserState {
  token: string
  userInfo: {
    id: number
    name: string
    role: 'teacher' | 'student'
  } | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),

  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    },
    setUserInfo(userInfo: UserState['userInfo']) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
