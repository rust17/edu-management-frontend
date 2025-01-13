<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface Bill {
  id: number
  courseName: string
  courseMonth: string
  studentName: string
  fee: number
  status: 'pending' | 'paid'
  sendTime: string
  payTime?: string
}

// 模拟数据
const billList = ref<Bill[]>([
  {
    id: 1,
    courseName: '高中数学',
    courseMonth: '2024-03',
    studentName: '李同学',
    fee: 500,
    status: 'pending',
    sendTime: '2024-03-01 10:00:00'
  },
  {
    id: 2,
    courseName: '高中数学',
    courseMonth: '2024-03',
    studentName: '王同学',
    fee: 500,
    status: 'paid',
    sendTime: '2024-03-01 10:00:00',
    payTime: '2024-03-02 15:30:00'
  }
])

// 搜索条件
const searchForm = ref({
  keyword: '',
  month: '',
  status: '',
  dateRange: []
})

// 表格加载状态
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 获取账单状态显示
const getBillStatusTag = (status: Bill['status']) => {
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
    status: '',
    dateRange: []
  }
}

// 导出账单
const handleExport = () => {
  // 这里应该调用导出账单的 API
  // 模拟下载
  const link = document.createElement('a')
  link.href = '#'
  link.download = '账单明细.xlsx'
  link.click()
}
</script>

<template>
  <div class="bill-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>账单管理</h2>
      <el-button type="primary" @click="handleExport">导出账单</el-button>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索课程名或学生名"
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
          <el-select v-model="searchForm.status" placeholder="选择状态">
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账单列表 -->
    <el-card class="list-card">
      <el-table
        :data="billList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="courseName" label="课程名称" min-width="150" />
        <el-table-column prop="courseMonth" label="课程年月" width="100" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column label="费用" width="120">
          <template #default="{ row }">
            ¥{{ row.fee }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getBillStatusTag(row.status).type"
              size="small"
            >
              {{ getBillStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="160" />
        <el-table-column prop="payTime" label="支付时间" width="160">
          <template #default="{ row }">
            {{ row.payTime || '-' }}
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
.bill-list {
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
  .bill-list {
    .el-form {
      .el-form-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .el-table {
      .cell {
        white-space: nowrap;
      }
    }
  }
}
</style>
