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
      <img src="@/assets/403.svg" alt="403" class="error-image">
      <h1>403</h1>
      <h2>Sorry, you don't have permission to access this page</h2>
      <p>Please check if you have the appropriate access rights</p>
      <div class="error-actions">
        <el-button @click="handleBack">Go Back</el-button>
        <el-button type="primary" @click="handleToHome">Go to Home</el-button>
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

// Responsive design
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
