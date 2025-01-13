<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const billId = route.params.id
const showPayDialog = ref(route.query.action === 'pay')

interface BillDetail {
  id: number
  courseName: string
  courseMonth: string
  teacherName: string
  fee: number
  status: 'pending' | 'paid'
  billNo: string
  sendTime: string
  payTime?: string
  payMethod?: 'wechat' | 'alipay'
}

const loading = ref(false)
const billDetail = ref<BillDetail>({
  id: 1,
  courseName: '高中数学',
  courseMonth: '2024-03',
  teacherName: '张老师',
  fee: 500,
  status: 'pending',
  billNo: 'BILL20240301001',
  sendTime: '2024-03-01 10:00:00'
})

// 支付相关
const payMethod = ref('wechat')
const payLoading = ref(false)

// 获取账单详情
const fetchBillDetail = async () => {
  loading.value = true
  try {
    // 这里应该调用获取账单详情的 API
    // 使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    ElMessage.error('获取账单信息失败')
  } finally {
    loading.value = false
  }
}

// 处理返回
const handleBack = () => {
  router.back()
}

// 处理支付
const handlePay = () => {
  showPayDialog.value = true
}

// 确认支付
const confirmPay = async () => {
  try {
    await ElMessageBox.confirm(
      `确认使用${payMethod.value === 'wechat' ? '微信支付' : '支付宝'}支付 ¥${billDetail.value.fee}？`,
      '确认支付',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    payLoading.value = true
    try {
      // 这里应该调用支付 API
      await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟支付过程
      ElMessage.success('支付成功')
      showPayDialog.value = false
      // 刷新账单详情
      await fetchBillDetail()
    } catch (error) {
      ElMessage.error('支付失败，请重试')
    } finally {
      payLoading.value = false
    }
  } catch {
    // 用户取消操作
  }
}

// 获取账单状态显示
const getBillStatusTag = (status: BillDetail['status']) => {
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

onMounted(() => {
  fetchBillDetail()
})
</script>

<template>
  <div class="bill-detail" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>账单详情</h2>
      </div>
      <div class="header-actions">
        <el-button
          v-if="billDetail.status === 'pending'"
          type="primary"
          @click="handlePay"
        >
          立即支付
        </el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <h3>账单信息</h3>
          <el-tag
            :type="getBillStatusTag(billDetail.status).type"
            size="small"
          >
            {{ getBillStatusTag(billDetail.status).label }}
          </el-tag>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="账单编号">
          {{ billDetail.billNo }}
        </el-descriptions-item>
        <el-descriptions-item label="账单金额">
          <span class="price">¥{{ billDetail.fee }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ billDetail.sendTime }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ billDetail.payTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="billDetail.status === 'paid'"
          label="支付方式"
        >
          {{ billDetail.payMethod === 'wechat' ? '微信支付' : '支付宝' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 课程信息 -->
    <el-card class="course-card">
      <template #header>
        <div class="card-header">
          <h3>课程信息</h3>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="课程名称">
          {{ billDetail.courseName }}
        </el-descriptions-item>
        <el-descriptions-item label="课程年月">
          {{ billDetail.courseMonth }}
        </el-descriptions-item>
        <el-descriptions-item label="任课教师">
          {{ billDetail.teacherName }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 支付弹窗 -->
    <el-dialog
      v-model="showPayDialog"
      title="选择支付方式"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="pay-info">
        <div class="info-row">
          <label>账单编号</label>
          <span>{{ billDetail.billNo }}</span>
        </div>
        <div class="info-row">
          <label>课程</label>
          <span>{{ billDetail.courseName }} ({{ billDetail.courseMonth }})</span>
        </div>
        <div class="info-row">
          <label>金额</label>
          <span class="price">¥{{ billDetail.fee }}</span>
        </div>
      </div>

      <div class="pay-methods">
        <el-radio-group v-model="payMethod">
          <div class="method-item">
            <el-radio label="wechat">
              <div class="method-content">
                <span class="icon">📱</span>
                <span>微信支付</span>
              </div>
            </el-radio>
          </div>
          <div class="method-item">
            <el-radio label="alipay">
              <div class="method-content">
                <span class="icon">💳</span>
                <span>支付宝</span>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPayDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="payLoading"
            @click="confirmPay"
          >
            确认支付
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.bill-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
    }
  }

  .info-card,
  .course-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  .price {
    color: #f5222d;
    font-weight: 500;
  }
}

// 支付弹窗样式
.pay-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      color: #909399;
    }
  }
}

.pay-methods {
  .method-item {
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .method-content {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;

      .icon {
        font-size: 24px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .bill-detail {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      .header-actions {
        width: 100%;

        .el-button {
          width: 100%;
        }
      }
    }

    .el-descriptions {
      .el-descriptions-item {
        margin-bottom: 16px;
      }
    }
  }
}
</style>
