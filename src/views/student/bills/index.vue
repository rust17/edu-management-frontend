<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()

interface Bill {
  id: number
  courseName: string
  courseMonth: string
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
    fee: 500,
    status: 'pending',
    sendTime: '2024-03-01 10:00:00'
  },
  {
    id: 2,
    courseName: '初中物理',
    courseMonth: '2024-03',
    fee: 400,
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

// 处理查看详情
const handleView = (id: number) => {
  router.push(`/student/bills/${id}`)
}

// 处理支付
const handlePay = (bill: Bill) => {
  router.push(`/student/bills/${bill.id}?action=pay`)
}
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
    <div class="bill-grid">
      <el-card
        v-for="bill in billList"
        :key="bill.id"
        class="bill-card"
        :body-style="{ padding: '0' }"
      >
        <div class="card-header">
          <h3>{{ bill.courseName }}</h3>
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
            <span>{{ bill.courseMonth }}</span>
          </div>
          <div class="info-item">
            <label>账单金额</label>
            <span class="price">¥{{ bill.fee }}</span>
          </div>
          <div class="info-item">
            <label>发送时间</label>
            <span>{{ bill.sendTime }}</span>
          </div>
          <div class="info-item">
            <label>支付时间</label>
            <span>{{ bill.payTime || '-' }}</span>
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
