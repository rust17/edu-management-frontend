<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search } from '@element-plus/icons-vue'
import request from '@/http/request'
import { courseEndpoints } from '@/http/endpoints/course'
import { DEFAULT_PAGINATION, type PaginationType } from '@/http/pagination'

const router = useRouter()

interface Course {
  id: number
  name: string
  year_month: string
  fee: string
  teacher_id: number
  students: number
}

// Course list data
const courseList = ref<Course[]>([])

// Search criteria
const searchForm = ref({
  keyword: '',
  year_month: ''
})

// Table loading status
const loading = ref(false)

// Pagination
const pagination = ref<PaginationType>(DEFAULT_PAGINATION())

// Get course list
const fetchCourses = async () => {
  loading.value = true
  try {
    const response = await request({
      url: courseEndpoints.teacher,
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

// Handle create course
const handleCreate = () => {
  router.push('/teacher/courses/create')
}

// Handle view details
const handleView = (id: number) => {
  router.push(`/teacher/courses/${id}`)
}

// Reset search criteria
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    year_month: ''
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

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="course-list">
    <!-- Page title and action buttons -->
    <div class="page-header">
      <h2>Course Management</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        Create Course
      </el-button>
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
        <el-form-item label="Year/Month">
          <el-date-picker
            v-model="searchForm.year_month"
            type="month"
            placeholder="Select year and month"
            format="YYYY-MM"
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
    <el-card class="list-card">
      <el-table
        :data="courseList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="Course Name" min-width="150" />
        <el-table-column prop="year_month" label="Year/Month" width="120" />
        <el-table-column label="Fee" width="120">
          <template #default="{ row }">
            ¥{{ row.fee }}
          </template>
        </el-table-column>
        <el-table-column prop="students" label="Students" width="100" />
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleView(row.id)"
            >
              View
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.course-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .list-card {
    .pagination {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
    }
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
  }
}
</style>
