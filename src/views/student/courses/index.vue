<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import request from '@/http/request'
import { courseEndpoints } from '@/http/endpoints/course'
import { DEFAULT_PAGINATION, type PaginationType } from '@/http/pagination'
import { getBillStatusTag } from '@/helpers/invoice'
import OpnPaymentButton from '@/components/OpnPaymentButton.vue'

const router = useRouter()

// Define course type
interface Course {
  id: number
  name: string
  year_month: string
  fee: string
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

// Course list data
const courseList = ref<Course[]>([])

// Search criteria
const searchForm = ref({
  keyword: '',
  year_month: '',
  invoice_status: ''
})

// Table loading status
const loading = ref(false)

// Pagination
const pagination = ref<PaginationType>(DEFAULT_PAGINATION())

// Payment related
const payLoadingMap = ref<Map<number, boolean>>(new Map())

// Get course list
const fetchCourses = async () => {
  loading.value = true
  try {
    const response = await request({
      url: courseEndpoints.student,
      method: 'get',
      params: {
        page: pagination.value.currentPage,
        per_page: pagination.value.pageSize,
        keyword: searchForm.value.keyword,
        year_month: searchForm.value.year_month
      }
    })

    const { data } = response.data
    courseList.value = data.data
    pagination.value.total = data.total
    pagination.value.currentPage = data.current_page
  } catch (error) {
    console.error('Failed to get course list:', error)
  } finally {
    loading.value = false
  }
}

// Reset search criteria
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    year_month: '',
    invoice_status: ''
  }
  pagination.value.currentPage = 1
  fetchCourses()
}

// Handle search
const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchCourses()
}

// Handle pagination change
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  fetchCourses()
}

// Handle view details
const handleView = (id: number) => {
  router.push(`/student/courses/${id}`)
}

// Handle payment success
const handlePaySuccess = async () => {
  await fetchCourses() // Refresh course list
}

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="course-list">
    <!-- Page title -->
    <div class="page-header">
      <h2>My Courses</h2>
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="resetSearch">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Course list -->
    <div class="course-grid" v-loading="loading">
      <el-card
        v-for="course in courseList"
        :key="course.id"
        class="course-card"
        :body-style="{ padding: '0' }"
      >
        <div class="card-header">
          <h3>{{ course.name }}</h3>
          <el-tag
            v-if="course.invoice_send_at"
            :type="getBillStatusTag(course.invoice_status).type"
            size="small"
          >
            {{ getBillStatusTag(course.invoice_status).label }}
          </el-tag>
        </div>
        <div class="card-content">
          <div class="info-item">
            <label>Course Year/Month</label>
            <span>{{ course.year_month }}</span>
          </div>
          <div class="info-item">
            <label>Teacher</label>
            <span>{{ course.teacher.name }}</span>
          </div>
          <div class="info-item">
            <label>Course Fee</label>
            <span class="price">¥{{ course.fee }}</span>
          </div>
        </div>
        <div class="card-footer">
          <el-button
            link
            type="primary"
            @click="handleView(course.id)"
          >
            View Details
          </el-button>
          <OpnPaymentButton
            v-if="course.invoice_send_at && (course.invoice_status === 'pending' || course.invoice_status === 'failed')"
            :loading="payLoadingMap.get(course.id) || false"
            @update:loading="(value) => payLoadingMap.set(course.id, value)"
            :invoiceId="course.invoice_id"
            :amount="course.fee"
            :description="`Pay bill ${course.invoice_no} - ${course.name}`"
            @success="handlePaySuccess"
          />
        </div>
      </el-card>
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
.course-list {
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

  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }

  .course-card {
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
  .course-list {
    .el-form {
      .el-form-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .course-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
