<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/http/request'
import { ElMessage } from 'element-plus'
import { authEndpoints } from '@/http/endpoints/auth'

const userStore = useUserStore()
const router = useRouter()

const isCollapse = ref(false)

const menuItems = computed(() => {
  const role = userStore.userInfo?.role
  if (role === 'teacher') {
    return [
      {
        index: '/teacher',
        icon: 'House',
        title: '首页'
      },
      {
        index: '/teacher/courses',
        icon: 'Reading',
        title: '课程管理'
      },
      {
        index: '/teacher/bills',
        icon: 'Money',
        title: '账单管理'
      }
    ]
  } else if (role === 'student') {
    return [
      {
        index: '/student',
        icon: 'House',
        title: '首页'
      },
      {
        index: '/student/courses',
        icon: 'Reading',
        title: '我的课程'
      },
      {
        index: '/student/bills',
        icon: 'Money',
        title: '我的账单'
      }
    ]
  }
  return []
})

const handleLogout = async () => {
  try {
    await request.post(authEndpoints.logout)
    userStore.logout()
    ElMessage.success('已成功登出')
    router.push('/login')
  } catch (error) {
    // 错误已经被拦截器处理，这里不需要额外处理
  }
}
</script>

<template>
  <div class="layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <div class="logo">
        <img src="@/assets/logo.svg" alt="logo">
        <span v-show="!isCollapse">教务管理系统</span>
      </div>
      <el-menu
        :default-active="$route.path"
        :collapse="isCollapse"
        router
        class="menu"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleLogout">
            <span class="user-info">
              {{ userStore.userInfo?.name }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  height: 100vh;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    color: white;

    img {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }
  }

  .menu {
    border-right: none;
    background-color: transparent;
    --el-menu-text-color: #bfcbd9;
    --el-menu-hover-bg-color: #263445;
  }
}

.container {
  flex: 1;
  overflow: hidden;
}

.header {
  background-color: white;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;

  .collapse-btn {
    font-size: 20px;
    cursor: pointer;
    color: #909399;
  }

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
  }
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
