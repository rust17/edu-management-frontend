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

// Get course details
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const response = await request({
      url: courseEndpoints.teacherDetail(Number(courseId)),
      method: 'get'
    })

    courseDetail.value = response.data.data
  } catch (error) {
    console.error('Failed to get course information:', error)
  } finally {
    loading.value = false
  }
}

// Handle edit course
const handleEdit = () => {
  router.push(`/teacher/courses/create?id=${courseId}`)
}

// Handle back
const handleBack = () => {
  router.back()
}

// Batch create invoices
const handleCreateBill = async (studentIds?: number[]) => {
  const isSingle = studentIds?.length === 1
  const students = courseDetail.value?.students.filter(s => studentIds?.includes(s.id))
  const confirmMessage = isSingle
    ? `Confirm to create an invoice for ${students?.[0]?.name}?`
    : 'Confirm to create invoices for all students?'

  try {
    await ElMessageBox.confirm(confirmMessage, 'Create Invoice', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })

    // Call the API to create invoices
    await request.post(invoiceEndpoints.create, {
      course_id: Number(courseId),
      student_ids: studentIds
    })

    ElMessage.success('Invoice created successfully')
    // Re-fetch course details to refresh invoice status
    await fetchCourseDetail()
  } catch (error: any) {
    if (error !== 'cancel') { // Do not show error message if the user cancels the operation
      ElMessage.error(error.response?.data?.message || 'Failed to send invoice')
    }
  }
}

// Get invoice status display
const getBillStatusTag = (status: Student['invoice_status']) => {
  const statusMap = {
    pending: {
      type: 'warning',
      label: 'Pending'
    },
    paid: {
      type: 'success',
      label: 'Paid'
    },
    failed: {
      type: 'danger',
      label: 'Failed'
    },
    null: {
      type: 'info',
      label: 'Not Sent'
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
    <!-- Page header -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          Back
        </el-button>
        <h2>Course Details</h2>
      </div>
      <div class="header-actions">
        <el-button @click="handleEdit">Edit Course</el-button>
        <el-tooltip
          content="Create invoices for all students who have not been invoiced"
          placement="bottom"
          effect="light"
        >
          <el-button
            type="primary"
            @click="handleCreateBill(courseDetail?.students.map(s => s.id))"
          >
            Batch Create Invoices
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Basic information -->
    <el-card class="info-card" v-if="courseDetail">
      <template #header>
        <div class="card-header">
          <h3>Basic Information</h3>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="Course Name">
          {{ courseDetail.name }}
        </el-descriptions-item>
        <el-descriptions-item label="Year/Month">
          {{ courseDetail.year_month }}
        </el-descriptions-item>
        <el-descriptions-item label="Course Fee">
          <span class="price">¥{{ courseDetail.fee }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Number of Students">
          {{ courseDetail.students.length }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Student list -->
    <el-card class="student-card" v-if="courseDetail">
      <template #header>
        <div class="card-header">
          <h3>Student List</h3>
        </div>
      </template>
      <el-table :data="courseDetail.students" style="width: 100%">
        <el-table-column prop="name" label="Name" min-width="150" />
        <el-table-column label="Invoice Status" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getBillStatusTag(row.invoice_status).type"
              size="small"
            >
              {{ getBillStatusTag(row.invoice_status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :disabled="row.invoice_status !== null"
              @click="handleCreateBill([row.id])"
            >
              Create Invoice
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

// Responsive design
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
