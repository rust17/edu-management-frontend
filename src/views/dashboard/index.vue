<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import request from '@/http/request'
import { statisEndpoints } from '@/http/endpoints/statistics'

const router = useRouter()
const userStore = useUserStore()

const userRole = computed(() => userStore.userInfo?.role)
const userName = computed(() => {
  let role = userStore.userInfo?.role || ''
  let displayRole = { teacher: 'Teacher', student: 'Student' }[role] || ''
  return userStore.userInfo?.name + ' ' + displayRole
})

// Statistics data
const statsData = ref({
  course_count: 0,
  invoice_count: 0,
  pending_invoice_count: 0
})

// Fetch statistics
const fetchStats = async () => {
  try {
    const response = await request({
      url: statisEndpoints[userRole.value as keyof typeof statisEndpoints],
      method: 'get'
    })

    const { data } = response.data
    statsData.value = data
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
  }
}

// Statistics cards data
const stats = computed(() => {
  if (userRole.value === 'teacher') {
    return {
      courses: {
        title: 'Total Courses',
        value: statsData.value.course_count,
        unit: '',
        icon: 'Document',
        color: '#1890ff',
        path: '/teacher/courses'
      },
      bills: {
        title: 'Total Invoices',
        value: statsData.value.invoice_count,
        unit: '',
        icon: 'Histogram',
        color: '#52c41a',
        path: '/teacher/bills'
      }
    }
  } else {
    return {
      courses: {
        title: 'My Courses',
        value: statsData.value.course_count,
        unit: '',
        icon: 'Document',
        color: '#1890ff',
        path: '/student/courses'
      },
      bills: {
        title: 'Pending Invoices',
        value: statsData.value.pending_invoice_count,
        unit: '',
        icon: 'Histogram',
        color: '#faad14',
        path: '/student/bills'
      }
    }
  }
})

onMounted(() => {
  fetchStats()
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
          <h2>Welcome back, {{ userName }}</h2>
          <span class="time">{{ new Date().toLocaleDateString() }}</span>
        </div>
      </template>
      <div class="welcome-content">
        <p>Today is a great day, let's get started!</p>
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

    <!-- Recent Activities -->
    <el-card class="recent-card">
      <template #header>
        <div class="card-header">
          <h3>Recent Activities</h3>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-if="userRole === 'teacher'"
          timestamp="2024-03-10"
          type="primary"
        >
          <h4>New Course</h4>
          <p>Created "High School Math" course</p>
        </el-timeline-item>
        <el-timeline-item
          v-if="userRole === 'student'"
          timestamp="2024-03-09"
          type="success"
        >
          <h4>Invoice Payment</h4>
          <p>Completed payment for "Middle School Physics" course</p>
        </el-timeline-item>
        <el-timeline-item timestamp="2024-03-08">
          <h4>System Notification</h4>
          <p>Welcome to Education Management System</p>
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

// Responsive design
@media (max-width: 768px) {
  .dashboard {
    .stats-container {
      grid-template-columns: 1fr;
    }
  }
}
</style>
