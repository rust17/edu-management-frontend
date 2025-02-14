<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/http/request'
import { courseEndpoints } from '@/http/endpoints/course'
import { getBillStatusTag } from '@/helpers/invoice'
import OpnPaymentButton from '@/components/OpnPaymentButton.vue'

const router = useRouter()
const route = useRoute()
const courseId = route.params.id

interface CourseDetail {
  id: number
  name: string
  year_month: string
  fee: string
  teacher_id: number
  teacher: {
    id: number
    name: string
  }
  invoice_status: 'pending' | 'paid' | 'failed'
  invoice_send_at: string
  invoice_id: number
  invoice_no: string
  paid_at: string
}

const loading = ref(false)
const courseDetail = ref<CourseDetail | null>(null)

// Payment related
const payLoading = ref(false)

// Get course details
const fetchCourseDetail = async () => {
  loading.value = true
  try {
    const response = await request({
      url: courseEndpoints.studentDetail(Number(courseId)),
      method: 'get'
    })

    courseDetail.value = response.data.data
  } catch (error) {
    console.error('Failed to get course information:', error)
  } finally {
    loading.value = false
  }
}

// Handle back
const handleBack = () => {
  router.back()
}

// Handle payment success
const handlePaySuccess = async () => {
  await fetchCourseDetail() // Refresh course details
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
        <OpnPaymentButton
          v-if="courseDetail?.invoice_send_at && (courseDetail?.invoice_status === 'pending' || courseDetail?.invoice_status === 'failed')"
          v-model:loading="payLoading"
          :amount="courseDetail.fee"
          :invoiceId="courseDetail.invoice_id"
          :description="`Pay bill ${courseDetail.invoice_no} - ${courseDetail.name}`"
          @success="handlePaySuccess"
        />
      </div>
    </div>

    <!-- Basic information -->
    <el-card class="info-card" v-if="courseDetail">
      <template #header>
        <div class="card-header">
          <h3>Basic Information</h3>
          <el-tag
            v-if="courseDetail.invoice_send_at"
            :type="getBillStatusTag(courseDetail.invoice_status).type"
            size="small"
          >
            {{ getBillStatusTag(courseDetail.invoice_status).label }}
          </el-tag>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="Course Name">
          {{ courseDetail.name }}
        </el-descriptions-item>
        <el-descriptions-item label="Year/Month">
          {{ courseDetail.year_month }}
        </el-descriptions-item>
        <el-descriptions-item label="Teacher">
          {{ courseDetail.teacher.name }}
        </el-descriptions-item>
        <el-descriptions-item label="Course Fee">
          <span class="price">¥{{ courseDetail.fee }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Invoice Send Time">
          {{ courseDetail.invoice_send_at || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Payment Time">
          {{ courseDetail.paid_at || '-' }}
        </el-descriptions-item>
      </el-descriptions>
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
  }

  .info-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

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
          width: 100%;
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
