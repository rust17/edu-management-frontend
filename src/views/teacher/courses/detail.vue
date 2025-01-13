<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const courseId = route.params.id

interface Student {
  id: number
  name: string
  billStatus: 'pending' | 'paid'
}

interface CourseDetail {
  id: number
  name: string
  month: string
  fee: number
  students: Student[]
}

const loading = ref(false)
const courseDetail = ref<CourseDetail>({
  id: 1,
  name: '高中数学',
  month: '2024-03',
  fee: 500,
  students: [
    { id: 1, name: '李同学', billStatus: 'pending' },
    { id: 2, name: '王同学', billStatus: 'paid' }
  ]
})

// 获取课程详情
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    // 这里应该调用获取课程详情的 API
    // 使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    ElMessage.error('获取课程信息失败')
  } finally {
    loading.value = false
  }
}

// 处理编辑课程
const handleEdit = () => {
  router.push(`/teacher/courses/create?id=${courseId}`)
}

// 处理返回
const handleBack = () => {
  router.back()
}

// 处理发送账单
const handleSendBill = async (studentId?: number) => {
  const isSingle = !!studentId
  const confirmMessage = isSingle
    ? `确认向 ${courseDetail.value.students.find(s => s.id === studentId)?.name} 发送账单？`
    : `确认向所有未支付的学生发送账单？`

  try {
    await ElMessageBox.confirm(confirmMessage, '发送账单', {
      confirmButtonText: '确认发送',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 这里应该调用发送账单的 API
    ElMessage.success('账单发送成功')
  } catch {
    // 用户取消操作
  }
}

// 获取账单状态显示
const getBillStatusTag = (status: Student['billStatus']) => {
  const statusMap = {
    pending: {
      type: 'warning',
      label: '待支付'
    },
    paid: {
      type: 'success',
      label: '已支付'
    }
  }
  return statusMap[status]
}

onMounted(() => {
  fetchCourseDetail()
})
</script>

<template>
  <div class="course-detail" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>课程详情</h2>
      </div>
      <div class="header-actions">
        <el-button @click="handleEdit">编辑课程</el-button>
        <el-button
          type="primary"
          @click="handleSendBill()"
        >
          发送账单
        </el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>基本信息</h3>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="课程名称">
          {{ courseDetail.name }}
        </el-descriptions-item>
        <el-descriptions-item label="年月">
          {{ courseDetail.month }}
        </el-descriptions-item>
        <el-descriptions-item label="课程费用">
          <span class="price">¥{{ courseDetail.fee }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="学生人数">
          {{ courseDetail.students.length }}人
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 学生列表 -->
    <el-card class="student-card">
      <template #header>
        <div class="card-header">
          <h3>学生名单</h3>
        </div>
      </template>
      <el-table :data="courseDetail.students" style="width: 100%">
        <el-table-column prop="name" label="姓名" min-width="150" />
        <el-table-column label="账单状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getBillStatusTag(row.billStatus).type"
              size="small"
            >
              {{ getBillStatusTag(row.billStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="row.billStatus === 'paid'"
              @click="handleSendBill(row.id)"
            >
              发送账单
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.course-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .info-card,
  .student-card {
    margin-bottom: 24px;

    .card-header {
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  .price {
    color: #f5222d;
    font-weight: 500;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .course-detail {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-actions {
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }

    .el-descriptions {
      .el-descriptions-item {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
