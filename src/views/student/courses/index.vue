<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import request from '@/http/request'
import { courseEndpoints } from '@/http/endpoints/course'
import { DEFAULT_PAGINATION, type PaginationType } from '@/http/pagination'
import { getBillStatusTag } from '@/helpers/invoice'

const router = useRouter()

// 定义课程类型
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
  paid_at: string
}

// 课程列表数据
const courseList = ref<Course[]>([])

// 搜索条件
const searchForm = ref({
  keyword: '',
  year_month: '',
  invoice_status: ''
})

// 表格加载状态
const loading = ref(false)

// 分页
const pagination = ref<PaginationType>(DEFAULT_PAGINATION())

// 获取课程列表
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
    console.error('获取课程列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    year_month: '',
    invoice_status: ''
  }
  pagination.value.currentPage = 1
  fetchCourses()
}

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchCourses()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  fetchCourses()
}

// 处理查看详情
const handleView = (id: number) => {
  router.push(`/student/courses/${id}`)
}

// 处理支付
const handlePay = (course: Course) => {
  router.push(`/student/courses/${course.id}?action=pay`)
}

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="course-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的课程</h2>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索课程名称"
            :prefix-icon="Search"
          />
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="searchForm.year_month"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程列表 -->
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
            :type="getBillStatusTag(course.invoice_status).type"
            size="small"
          >
            {{ getBillStatusTag(course.invoice_status).label }}
          </el-tag>
        </div>
        <div class="card-content">
          <div class="info-item">
            <label>课程年月</label>
            <span>{{ course.year_month }}</span>
          </div>
          <div class="info-item">
            <label>任课教师</label>
            <span>{{ course.teacher.name }}</span>
          </div>
          <div class="info-item">
            <label>课程费用</label>
            <span class="price">¥{{ course.fee }}</span>
          </div>
        </div>
        <div class="card-footer">
          <el-button
            link
            type="primary"
            @click="handleView(course.id)"
          >
            查看详情
          </el-button>
          <el-button
            v-if="course.invoice_status === 'pending'"
            type="primary"
            @click="handlePay(course)"
          >
            立即支付
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
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

// 响应式设计
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
