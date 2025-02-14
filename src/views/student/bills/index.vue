<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import request from '@/http/request'
import { invoiceEndpoints } from '@/http/endpoints/invoice'
import { DEFAULT_PAGINATION, type PaginationType } from '@/http/pagination'
import { getBillStatusTag } from '@/helpers/invoice'
import OpnPaymentButton from '@/components/OpnPaymentButton.vue'

const router = useRouter()

interface Bill {
  id: number
  no: string
  course_id: number
  student_id: number
  amount: string
  status: 'pending' | 'paid' | 'failed'
  send_at: string
  paid_at: string
  course: {
    id: number
    name: string
    year_month: string
  }
}

// Bill list data
const billList = ref<Bill[]>([])

// Search criteria
const searchForm = ref({
  keyword: '',
  year_month: '',
  status: '',
  send_start: '',
  send_end: ''
})

// Table loading status
const loading = ref(false)

// Pagination
const pagination = ref<PaginationType>(DEFAULT_PAGINATION())

// Bill status options
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' }
]

// Get bill list
const fetchBills = async () => {
  loading.value = true
  try {
    const response = await request({
      url: invoiceEndpoints.studentList,
      method: 'get',
      params: {
        page: pagination.value.currentPage,
        per_page: pagination.value.pageSize,
        keyword: searchForm.value.keyword,
        year_month: searchForm.value.year_month,
        status: searchForm.value.status,
        send_start: searchForm.value.send_start,
        send_end: searchForm.value.send_end
      }
    })

    const { data } = response.data
    billList.value = data.data
    pagination.value.total = data.total
    pagination.value.currentPage = data.current_page
  } catch (error) {
    console.error('Failed to get bill list:', error)
  } finally {
    loading.value = false
  }
}

// Reset search criteria
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    year_month: '',
    status: '',
    send_start: '',
    send_end: ''
  }
  pagination.value.currentPage = 1
  fetchBills()
}

// Handle search
const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchBills()
}

// Handle pagination change
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  fetchBills()
}

// Handle view details
const handleView = (id: number) => {
  router.push(`/student/bills/${id}`)
}

// Payment related
const payLoadingMap = ref<Map<number, boolean>>(new Map())

// Handle payment success
const handlePaySuccess = async () => {
  await fetchBills() // Refresh bill list
}

onMounted(() => {
  fetchBills()
})
</script>

<template>
  <div class="bill-list">
    <!-- Page title -->
    <div class="page-header">
      <h2>My Bills</h2>
    </div>

    <!-- Search form -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="Keyword">
          <el-input
            v-model="searchForm.keyword"
            placeholder="Search course name"
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="Month">
          <el-date-picker
            v-model="searchForm.year_month"
            type="month"
            placeholder="Select month"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="Bill Status">
          <el-select v-model="searchForm.status" placeholder="Select status" style="width: 100px" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Send Time">
          <el-date-picker
            v-model="searchForm.send_start"
            type="date"
            placeholder="Start date"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
          <span class="mx-2">to</span>
          <el-date-picker
            v-model="searchForm.send_end"
            type="date"
            placeholder="End date"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Bill list -->
    <div class="bill-grid" v-loading="loading">
      <template v-if="billList.length > 0">
        <el-card
          v-for="bill in billList"
          :key="bill.id"
          class="bill-card"
          :body-style="{ padding: '0' }"
        >
          <div class="card-header">
            <h3>{{ bill.course.name }}</h3>
            <el-tag
              :type="getBillStatusTag(bill.status).type"
              size="small"
            >
              {{ getBillStatusTag(bill.status).label }}
            </el-tag>
          </div>
          <div class="card-content">
            <div class="info-item">
              <label>Course Year/Month</label>
              <span>{{ bill.course.year_month }}</span>
            </div>
            <div class="info-item">
              <label>Bill Amount</label>
              <span class="price">¥{{ bill.amount }}</span>
            </div>
            <div class="info-item">
              <label>Send Time</label>
              <span>{{ bill.send_at }}</span>
            </div>
            <div class="info-item">
              <label>Payment Time</label>
              <span>{{ bill.paid_at || '-' }}</span>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              link
              type="primary"
              @click="handleView(bill.id)"
            >
              View Details
            </el-button>
            <OpnPaymentButton
              v-if="bill.status === 'pending' || bill.status === 'failed'"
              :loading="payLoadingMap.get(bill.id) || false"
              @update:loading="(value) => payLoadingMap.set(bill.id, value)"
              :invoiceId="bill.id"
              :amount="bill.amount"
              :description="`Pay bill ${bill.no} - ${bill.course.name}`"
              @success="handlePaySuccess"
            />
          </div>
        </el-card>
      </template>
      <el-empty
        v-else
        description="No bill data"
        :image-size="200"
      >
        <template #image>
          <el-icon :size="60" style="color: #909399">
            <el-icon-document />
          </el-icon>
        </template>
      </el-empty>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
        background
        layout="prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.bill-list {
  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
  }

  .search-card {
    margin-bottom: 24px;
  }

  .bill-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
    min-height: 300px;

    .el-empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 40px 0;
    }
  }

  .bill-card {
    .card-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }

    .card-content {
      padding: 16px;

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        label {
          color: #909399;
        }

        .price {
          color: #f5222d;
          font-weight: 500;
        }
      }
    }

    .card-footer {
      padding: 12px 16px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
  }
}

// Responsive design
@media (max-width: 768px) {
  .bill-list {
    .el-form {
      .el-form-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .bill-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
