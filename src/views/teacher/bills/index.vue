<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import request from '@/http/request'
import { invoiceEndpoints } from '@/http/endpoints/invoice'
import { DEFAULT_PAGINATION, type PaginationType } from '@/http/pagination'
import { ElMessage } from 'element-plus'
import { exportToCsv } from '@/utils/export'

interface Bill {
  id: number
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
  student_name: string
}

interface ExportBill {
  '课程名称': string
  '课程年月': string
  '学生姓名': string
  '费用(元)': string
  '账单状态': string
  '发送时间': string
  '支付时间': string
}

// 账单列表数据
const billList = ref<Bill[]>([])

// 搜索条件
const searchForm = ref({
  keyword: '',
  year_month: '',
  status: '',
  send_start: '',
  send_end: ''
})

// 表格加载状态
const loading = ref(false)

// 分页
const pagination = ref<PaginationType>(DEFAULT_PAGINATION())

// 账单状态选项
const statusOptions = [
  { value: 'pending', label: '待支付' },
  { value: 'paid', label: '已支付' },
  { value: 'failed', label: '支付失败' }
]

// 获取账单列表
const fetchBills = async () => {
  loading.value = true
  try {
    const response = await request({
      url: invoiceEndpoints.teacher,
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
    console.error('获取账单列表失败:', error)
  } finally {
    loading.value = false
  }
}

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
    },
    failed: {
      type: 'danger',
      label: '支付失败'
    }
  }
  return statusMap[status]
}

// 重置搜索条件
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

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
  fetchBills()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page
  fetchBills()
}

// 导出账单
const handleExport = async () => {
  loading.value = true
  try {
    // 获取所有账单数据
    const response = await request({
      url: invoiceEndpoints.teacher,
      method: 'get',
      params: {
        page: 1,
        per_page: 100,
        keyword: searchForm.value.keyword,
        year_month: searchForm.value.year_month,
        status: searchForm.value.status,
        send_start: searchForm.value.send_start,
        send_end: searchForm.value.send_end
      }
    })

    const bills = response.data.data.data

    // 定义导出列
    const exportColumns: Array<{
      title: string
      key: keyof Bill | ((row: Bill) => string)
    }> = [
      { title: '课程名称', key: (row: Bill) => row.course.name },
      { title: '课程年月', key: (row: Bill) => row.course.year_month },
      { title: '学生姓名', key: 'student_name' },
      { title: '费用(元)', key: 'amount' },
      { title: '账单状态', key: (row: Bill) => getBillStatusTag(row.status).label },
      { title: '发送时间', key: 'send_at' },
      { title: '支付时间', key: (row: Bill) => row.paid_at || '-' }
    ]

    // 导出数据
    exportToCsv(bills, exportColumns, '账单明细')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出账单失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBills()
})
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
        <el-form-item label="年月">
          <el-date-picker
            v-model="searchForm.year_month"
            type="month"
            placeholder="选择年月"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="账单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            style="width: 100px"
            clearable
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
          <el-date-picker
            v-model="searchForm.send_start"
            type="date"
            placeholder="开始日期"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
          <span class="mx-2">至</span>
          <el-date-picker
            v-model="searchForm.send_end"
            type="date"
            placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
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
        <el-table-column prop="course.name" label="课程名称" min-width="150" />
        <el-table-column prop="course.year_month" label="课程年月" width="100" />
        <el-table-column prop="student_name" label="学生姓名" width="120" />
        <el-table-column label="费用" width="120">
          <template #default="{ row }">
            ¥{{ row.amount }}
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
        <el-table-column prop="send_at" label="发送时间" width="160" />
        <el-table-column prop="paid_at" label="支付时间" width="160">
          <template #default="{ row }">
            {{ row.paid_at || '-' }}
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
