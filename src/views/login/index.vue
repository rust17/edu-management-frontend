<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Reading, Money, DataAnalysis } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

interface LoginForm {
  username: string
  password: string
  role: 'teacher' | 'student'
}

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  role: 'student'
})

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ]
}

const formRef = ref<FormInstance>()
const loading = ref(false)

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 这里应该调用实际的登录 API
        // 模拟登录成功
        const token = 'mock_token'
        const userInfo = {
          id: 1,
          name: loginForm.role === 'teacher' ? '张老师' : '李同学',
          role: loginForm.role
        }

        userStore.setToken(token)
        userStore.setUserInfo(userInfo)

        // 根据角色跳转到不同的首页
        router.push('/')
      } catch (error) {
        ElMessage.error('登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <div class="login-container">
    <div class="login-banner">
      <div class="banner-content">
        <h1>教务管理系统</h1>
        <p>高效便捷的教学管理平台</p>
        <div class="feature-list">
          <div class="feature-item">
            <el-icon><Reading /></el-icon>
            <span>课程管理</span>
          </div>
          <div class="feature-item">
            <el-icon><Money /></el-icon>
            <span>账单管理</span>
          </div>
          <div class="feature-item">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据分析</span>
          </div>
        </div>
      </div>
    </div>
    <div class="login-form">
      <div class="form-wrapper">
        <div class="form-header">
          <img src="@/assets/logo.svg" alt="logo">
          <h2>账号登录</h2>
        </div>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="用户类型" prop="role">
            <el-radio-group v-model="loginForm.role">
              <el-radio-button label="student">学生</el-radio-button>
              <el-radio-button label="teacher">教师</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-button"
              @click="handleLogin(formRef)"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  background-color: #f0f2f5;
}

.login-banner {
  flex: 1;
  background: linear-gradient(135deg, #1890ff 0%, #1d39c4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 48px;

  .banner-content {
    max-width: 480px;

    h1 {
      font-size: 48px;
      font-weight: 600;
      margin: 0 0 24px;
    }

    p {
      font-size: 24px;
      margin: 0 0 48px;
      opacity: 0.9;
    }

    .feature-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;

      .feature-item {
        text-align: center;
        padding: 24px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.2);
        }

        .el-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        span {
          font-size: 16px;
        }
      }
    }
  }
}

.login-form {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;

  .form-wrapper {
    width: 100%;
    max-width: 360px;
    padding: 0 24px;

    .form-header {
      text-align: center;
      margin-bottom: 40px;

      img {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        color: #303133;
      }
    }

    .login-button {
      width: 100%;
      padding: 12px 0;
    }
  }
}

// 响应式设计
@media (max-width: 992px) {
  .login-container {
    flex-direction: column;
  }

  .login-banner {
    display: none;
  }

  .login-form {
    width: 100%;
    height: 100%;
    background-color: #f0f2f5;

    .form-wrapper {
      background: white;
      padding: 40px 24px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
}

@media (max-width: 576px) {
  .login-form {
    background-color: white;

    .form-wrapper {
      box-shadow: none;
      padding: 20px;
    }
  }
}
</style>
