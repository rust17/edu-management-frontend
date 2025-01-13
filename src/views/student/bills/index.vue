<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import request from '@/http/request'
import { invoiceEndpoints } from '@/http/endpoints/invoice'
import { DEFAULT_PAGINATION, type PaginationType } from '@/http/pagination'

const router = useRouter()

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

// 获取账单列表
const fetchBills = async () => {
  loading.value = true
  try {
    const response = await request({
      url: invoiceEndpoints.student,
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

// 处理查看详情
const handleView = (id: number) => {
  router.push(`/student/bills/${id}`)
}

// 处理支付
const handlePay = (bill: Bill) => {
  router.push(`/student/bills/${bill.id}?action=pay`)
}

onMounted(() => {
  fetchBills()
})
</script>

<template>
  <div class="bill-list">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>我的账单</h2>
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
        <el-form-item label="账单状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" style="width: 100px" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
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
    <div class="bill-grid" v-loading="loading">
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
            <label>课程年月</label>
            <span>{{ bill.course.year_month }}</span>
          </div>
          <div class="info-item">
            <label>账单金额</label>
            <span class="price">¥{{ bill.amount }}</span>
          </div>
          <div class="info-item">
            <label>发送时间</label>
            <span>{{ bill.send_at }}</span>
          </div>
          <div class="info-item">
            <label>支付时间</label>
            <span>{{ bill.paid_at || '-' }}</span>
          </div>
        </div>
        <div class="card-footer">
          <el-button
            link
            type="primary"
            @click="handleView(bill.id)"
          >
            查看详情
          </el-button>
          <el-button
            v-if="bill.status === 'pending'"
            type="primary"
            @click="handlePay(bill)"
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

    .bill-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
