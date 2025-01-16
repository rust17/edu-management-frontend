<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/http/request'
import { courseEndpoints } from '@/http/endpoints/course'
import { invoiceEndpoints } from '@/http/endpoints/invoice'

const router = useRouter()
const route = useRoute()
const courseId = route.params.id

interface Student {
  id: number
  name: string
  invoice_status: 'pending' | 'paid' | 'failed' | null
}

interface CourseDetail {
  id: number
  name: string
  year_month: string
  fee: string
  teacher_id: number
  students: Student[]
}

const loading = ref(false)
const courseDetail = ref<CourseDetail | null>(null)

// 获取课程详情
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const response = await request({
      url: courseEndpoints.teacherDetail(Number(courseId)),
      method: 'get'
    })

    courseDetail.value = response.data.data
  } catch (error) {
    console.error('获取课程信息失败:', error)
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

// 批量创建账单
const handleCreateBill = async (studentIds?: number[]) => {
  const isSingle = studentIds?.length === 1
  const students = courseDetail.value?.students.filter(s => studentIds?.includes(s.id))
  const confirmMessage = isSingle
    ? `确认向 ${students?.[0]?.name} 创建账单？`
    : '确认向所有学生创建账单？'

  try {
    await ElMessageBox.confirm(confirmMessage, '创建账单', {
      confirmButtonText: '确认创建',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用创建账单的 API
    await request.post(invoiceEndpoints.create, {
      course_id: Number(courseId),
      student_ids: studentIds
    })

    ElMessage.success('账单创建成功')
    // 重新获取课程详情，刷新账单状态
    await fetchCourseDetail()
  } catch (error: any) {
    if (error !== 'cancel') { // 用户取消操作不显示错误提示
      ElMessage.error(error.response?.data?.message || '账单发送失败')
    }
  }
}

// 获取账单状态显示
const getBillStatusTag = (status: Student['invoice_status']) => {
  const statusMap = {
    pending: {
      type: 'warning',
      label: '待支付'
    },
    paid: {
      type: 'success',
      label: '已支付'
    },
    failed: {
      type: 'danger',
      label: '支付失败'
    },
    null: {
      type: 'info',
      label: '未发送'
    }
  }
  return statusMap[status || 'null']
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
        <el-tooltip
          content="为所有未创建账单的学生创建账单"
          placement="bottom"
          effect="light"
        >
          <el-button
            type="primary"
            @click="handleCreateBill(courseDetail?.students.map(s => s.id))"
          >
            批量创建账单
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 基本信息 -->
    <el-card class="info-card" v-if="courseDetail">
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
          {{ courseDetail.year_month }}
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
    <el-card class="student-card" v-if="courseDetail">
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
              :type="getBillStatusTag(row.invoice_status).type"
              size="small"
            >
              {{ getBillStatusTag(row.invoice_status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="row.invoice_status !== null"
              @click="handleCreateBill([row.id])"
            >
              创建账单
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
