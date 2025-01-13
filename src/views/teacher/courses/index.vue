<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const router = useRouter()

interface Course {
  id: number
  name: string
  month: string
  fee: number
  studentCount: number
  billStatus: 'pending' | 'partial' | 'completed'
}

// 模拟数据，实际项目中应该从API获取
const courseList = ref<Course[]>([
  {
    id: 1,
    name: '高中数学',
    month: '2024-03',
    fee: 500,
    studentCount: 3,
    billStatus: 'pending'
  },
  {
    id: 2,
    name: '初中物理',
    month: '2024-03',
    fee: 400,
    studentCount: 2,
    billStatus: 'completed'
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

// 处理创建课程
const handleCreate = () => {
  router.push('/teacher/courses/create')
}

// 处理查看详情
const handleView = (id: number) => {
  router.push(`/teacher/courses/${id}`)
}

// 处理发送账单
const handleSendBill = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确认向所有学生发送 ${course.name} (${course.month}) 的账单吗？`,
      '发送账单',
      {
        confirmButtonText: '确认发送',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 这里应该调用发送账单的 API
    ElMessage.success('账单发送成功')
  } catch {
    // 用户取消操作
  }
}

// 获取账单状态显示
const getBillStatusTag = (status: Course['billStatus']) => {
  const statusMap = {
    pending: {
      type: 'warning',
      label: '未发送'
    },
    partial: {
      type: 'info',
      label: '部分完成'
    },
    completed: {
      type: 'success',
      label: '已完成'
    }
  }
  return statusMap[status]
}

// 在 script setup 中添加分页相关的响应式数据
const currentPage = ref(1)
const pageSize = ref(10)
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
        <el-form-item label="月份">
          <el-date-picker
            v-model="searchForm.month"
            type="month"
            placeholder="选择月份"
          />
        </el-form-item>
        <el-form-item label="账单状态">
          <el-select v-model="searchForm.billStatus" placeholder="选择状态">
            <el-option label="未发送" value="pending" />
            <el-option label="部分完成" value="partial" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button @click="searchForm = { keyword: '', month: '', billStatus: '' }">
            重置
          </el-button>
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
        <el-table-column prop="month" label="年月" width="120" />
        <el-table-column label="费用" width="120">
          <template #default="{ row }">
            ¥{{ row.fee }}
          </template>
        </el-table-column>
        <el-table-column prop="studentCount" label="学生数" width="100" />
        <el-table-column label="账单状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getBillStatusTag(row.billStatus).type"
              size="small"
            >
              {{ getBillStatusTag(row.billStatus).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              @click="handleView(row.id)"
            >
              查看
            </el-button>
            <el-button
              link
              type="primary"
              :disabled="row.billStatus === 'completed'"
              @click="handleSendBill(row)"
            >
              发送账单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
