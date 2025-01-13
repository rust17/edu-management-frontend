<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleBack = () => {
  router.back()
}

const handleToHome = () => {
  const role = userStore.userInfo?.role || 'teacher'
  router.push(`/${role}`)
}
</script>

<template>
  <div class="error-page">
    <div class="error-content">
      <img src="@/assets/404.svg" alt="404" class="error-image">
      <h1>404</h1>
      <h2>抱歉，您访问的页面不存在</h2>
      <p>请检查您输入的网址是否正确</p>
      <div class="error-actions">
        <el-button @click="handleBack">返回上页</el-button>
        <el-button type="primary" @click="handleToHome">回到首页</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;

  .error-content {
    text-align: center;
    padding: 32px;

    .error-image {
      width: 240px;
      margin-bottom: 24px;
    }

    h1 {
      font-size: 72px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px;
    }

    h2 {
      font-size: 24px;
      color: #606266;
      margin: 0 0 16px;
    }

    p {
      font-size: 16px;
      color: #909399;
      margin: 0 0 24px;
    }

    .error-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .error-page {
    .error-content {
      padding: 24px;

      .error-image {
        width: 180px;
      }

      h1 {
        font-size: 48px;
      }

      h2 {
        font-size: 20px;
      }

      .error-actions {
        flex-direction: column;
        gap: 12px;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
