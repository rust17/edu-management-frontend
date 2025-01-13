<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()

interface Course {
  id: number
  name: string
  month: string
  fee: number
  teacherName: string
  billStatus: 'pending' | 'paid'
}

// 模拟数据
const courseList = ref<Course[]>([
  {
    id: 1,
    name: '高中数学',
    month: '2024-03',
    fee: 500,
    teacherName: '张老师',
    billStatus: 'pending'
  },
  {
    id: 2,
    name: '初中物理',
    month: '2024-03',
    fee: 400,
    teacherName: '王老师',
    billStatus: 'paid'
  }
])

// 搜索条件
const searchForm = ref({
  keyword: '',
  month: '',
  billStatus: ''
})

// 表格加载状态
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 获取账单状态显示
const getBillStatusTag = (status: Course['billStatus']) => {
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

// 重置搜索条件
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    month: '',
    billStatus: ''
  }
}

// 处理查看详情
const handleView = (id: number) => {
  router.push(`/student/courses/${id}`)
}

// 处理支付
const handlePay = (course: Course) => {
  router.push(`/student/courses/${course.id}?action=pay`)
}
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
            v-model="searchForm.month"
            type="month"
            placeholder="选择月份"
          />
        </el-form-item>
        <el-form-item label="账单状态">
          <el-select v-model="searchForm.billStatus" placeholder="选择状态">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程列表 -->
    <div class="course-grid">
      <el-card
        v-for="course in courseList"
        :key="course.id"
        class="course-card"
        :body-style="{ padding: '0' }"
      >
        <div class="card-header">
          <h3>{{ course.name }}</h3>
          <el-tag
            :type="getBillStatusTag(course.billStatus).type"
            size="small"
          >
            {{ getBillStatusTag(course.billStatus).label }}
          </el-tag>
        </div>
        <div class="card-content">
          <div class="info-item">
            <label>课程年月</label>
            <span>{{ course.month }}</span>
          </div>
          <div class="info-item">
            <label>任课教师</label>
            <span>{{ course.teacherName }}</span>
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
            v-if="course.billStatus === 'pending'"
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
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="20"
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
