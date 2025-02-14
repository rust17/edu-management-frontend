<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/http/request'
import { invoiceEndpoints } from '@/http/endpoints/invoice'
import { getBillStatusTag } from '@/helpers/invoice'
import OpnPaymentButton from '@/components/OpnPaymentButton.vue'

const router = useRouter()
const route = useRoute()
const billId = route.params.id

interface BillDetail {
  id: number
  course_id: number
  student_id: number
  amount: string
  status: 'pending' | 'paid' | 'failed'
  no: string
  send_at: string
  paid_at: string
  course: {
    id: number
    name: string
    year_month: string
    teacher_name: string
  }
}

const loading = ref(false)
const billDetail = ref<BillDetail | null>(null)

// Payment related
const payLoading = ref(false)

// Fetch bill details
const fetchBillDetail = async () => {
  loading.value = true
  try {
    const response = await request({
      url: invoiceEndpoints.studentDetail(Number(billId)),
      method: 'get'
    })

    billDetail.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch bill details:', error)
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
  await fetchBillDetail() // Refresh bill details
}

onMounted(() => {
  fetchBillDetail()
})
</script>

<template>
  <div class="bill-detail" v-loading="loading">
    <!-- Page header -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          Back
        </el-button>
        <h2>Bill Details</h2>
      </div>
      <div class="header-actions">
        <OpnPaymentButton
          v-if="billDetail?.status === 'pending' || billDetail?.status === 'failed'"
          :loading="payLoading"
          @update:loading="(value) => payLoading = value"
          :invoiceId="billDetail.id"
          :amount="billDetail.amount"
          :description="`Pay bill ${billDetail.no} - ${billDetail.course.name}`"
          @success="handlePaySuccess"
        />
      </div>
    </div>

    <!-- Basic information -->
    <el-card class="info-card" v-if="billDetail">
      <template #header>
        <div class="card-header">
          <h3>Bill Information</h3>
          <el-tag
            :type="getBillStatusTag(billDetail.status).type"
            size="small"
          >
            {{ getBillStatusTag(billDetail.status).label }}
          </el-tag>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="Bill No.">
          {{ billDetail.no || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="Amount">
          <span class="price">¥{{ billDetail.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="Sent At">
          {{ billDetail.send_at }}
        </el-descriptions-item>
        <el-descriptions-item label="Paid At">
          {{ billDetail.paid_at || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- Course information -->
    <el-card class="course-card" v-if="billDetail">
      <template #header>
        <div class="card-header">
          <h3>Course Information</h3>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="Course Name">
          {{ billDetail.course.name }}
        </el-descriptions-item>
        <el-descriptions-item label="Year/Month">
          {{ billDetail.course.year_month }}
        </el-descriptions-item>
        <el-descriptions-item label="Teacher">
          {{ billDetail.course.teacher_name }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.bill-detail {
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

  .info-card,
  .course-card {
    margin-bottom: 24px;

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
  .bill-detail {
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
