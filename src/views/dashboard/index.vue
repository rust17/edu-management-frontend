<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const userRole = computed(() => userStore.userInfo?.role)
const userName = computed(() => userStore.userInfo?.name)

// 统计数据（实际项目中应该从API获取）
const stats = computed(() => {
  if (userRole.value === 'teacher') {
    return {
      courses: {
        title: '课程总数',
        value: 12,
        unit: '个',
        icon: 'Document',
        color: '#1890ff',
        path: '/teacher/courses'
      },
      bills: {
        title: '待处理账单',
        value: 3,
        unit: '个',
        icon: 'Histogram',
        color: '#52c41a',
        path: '/teacher/bills'
      }
    }
  } else {
    return {
      courses: {
        title: '我的课程',
        value: 3,
        unit: '个',
        icon: 'Document',
        color: '#1890ff',
        path: '/student/courses'
      },
      bills: {
        title: '待支付账单',
        value: 1,
        unit: '个',
        icon: 'Histogram',
        color: '#faad14',
        path: '/student/bills'
      }
    }
  }
})

const handleCardClick = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="dashboard">
    <el-card class="welcome-card">
      <template #header>
        <div class="welcome-header">
          <h2>欢迎回来，{{ userName }}</h2>
          <span class="time">{{ new Date().toLocaleDateString() }}</span>
        </div>
      </template>
      <div class="welcome-content">
        <p>今天是美好的一天，让我们开始工作吧！</p>
      </div>
    </el-card>

    <div class="stats-container">
      <el-card
        v-for="(stat, key) in stats"
        :key="key"
        class="stat-card"
        shadow="hover"
        @click="handleCardClick(stat.path)"
      >
        <div class="stat-content">
          <div class="stat-info">
            <p class="stat-title">{{ stat.title }}</p>
            <p class="stat-value">
              {{ stat.value }}
              <span class="stat-unit">{{ stat.unit }}</span>
            </p>
          </div>
          <el-icon
            class="stat-icon"
            :style="{ backgroundColor: stat.color }"
          >
            <component :is="stat.icon" />
          </el-icon>
        </div>
      </el-card>
    </div>

    <!-- 最近动态 -->
    <el-card class="recent-card">
      <template #header>
        <div class="card-header">
          <h3>最近动态</h3>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-if="userRole === 'teacher'"
          timestamp="2024-03-10"
          type="primary"
        >
          <h4>新建课程</h4>
          <p>创建了"高中数学"课程</p>
        </el-timeline-item>
        <el-timeline-item
          v-if="userRole === 'student'"
          timestamp="2024-03-09"
          type="success"
        >
          <h4>账单支付</h4>
          <p>完成了"初中物理"课程的账单支付</p>
        </el-timeline-item>
        <el-timeline-item timestamp="2024-03-08">
          <h4>系统通知</h4>
          <p>欢迎使用教务管理系统</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  .welcome-card {
    margin-bottom: 24px;

    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .time {
        color: #909399;
      }
    }

    .welcome-content {
      color: #606266;
    }
  }

  .stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 24px;

    .stat-card {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .stat-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-info {
        .stat-title {
          margin: 0 0 8px;
          color: #909399;
          font-size: 14px;
        }

        .stat-value {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
          color: #303133;

          .stat-unit {
            font-size: 14px;
            margin-left: 4px;
            color: #909399;
          }
        }
      }

      .stat-icon {
        padding: 12px;
        border-radius: 8px;
        font-size: 24px;
        color: white;
      }
    }
  }

  .recent-card {
    .card-header {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }

    :deep(.el-timeline-item__content) {
      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 500;
      }

      p {
        margin: 0;
        color: #606266;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    .stats-container {
      grid-template-columns: 1fr;
    }
  }
}
</style>
