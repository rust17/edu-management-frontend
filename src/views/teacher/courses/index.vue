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

// 课程列表数据
const courseList = ref<Course[]>([])

// 搜索条件
const searchForm = ref({
  keyword: '',
  year_month: ''
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
    console.error('获取课程列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理创建课程
const handleCreate = () => {
  router.push('/teacher/courses/create')
}

// 处理查看详情
const handleView = (id: number) => {
  router.push(`/teacher/courses/${id}`)
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    year_month: ''
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

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="course-list">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2>课程管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        创建课程
      </el-button>
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
        <el-form-item label="年月">
          <el-date-picker
            v-model="searchForm.year_month"
            type="month"
            placeholder="选择年月"
            format="YYYY-MM"
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
    <el-card class="list-card">
      <el-table
        :data="courseList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="name" label="课程名称" min-width="150" />
        <el-table-column prop="year_month" label="年月" width="120" />
        <el-table-column label="费用" width="120">
          <template #default="{ row }">
            ¥{{ row.fee }}
          </template>
        </el-table-column>
        <el-table-column prop="students" label="学生数" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleView(row.id)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
  }
}
</style>
