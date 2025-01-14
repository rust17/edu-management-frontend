<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import request from '@/http/request'
import { invoiceEndpoints } from '@/http/endpoints/invoice'
import { getBillStatusTag } from '@/helpers/invoice'

const router = useRouter()
const route = useRoute()
const billId = route.params.id
const showPayDialog = ref(route.query.action === 'pay')

interface BillDetail {
  id: number
  course_id: number
  student_id: number
  amount: string
  status: 'pending' | 'paid' | 'failed'
  no: string
  send_at: string
  paid_at: string
  course: {
    id: number
    name: string
    year_month: string
    teacher_name: string
  }
}

const loading = ref(false)
const billDetail = ref<BillDetail | null>(null)

// 支付相关
const payMethod = ref('wechat')
const payLoading = ref(false)

// 获取账单详情
const fetchBillDetail = async () => {
  loading.value = true
  try {
    const response = await request({
      url: invoiceEndpoints.studentDetail(Number(billId)),
      method: 'get'
    })

    billDetail.value = response.data.data
  } catch (error) {
    console.error('获取账单信息失败:', error)
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
      `确认使用${payMethod.value === 'wechat' ? '微信支付' : '支付宝'}支付 ¥${billDetail.value?.amount}？`,
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
          v-if="billDetail?.status === 'pending'"
          type="primary"
          @click="handlePay"
        >
          立即支付
        </el-button>
      </div>
    </div>

    <!-- 基本信息 -->
    <el-card class="info-card" v-if="billDetail">
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
          {{ billDetail.no || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="账单金额">
          <span class="price">¥{{ billDetail.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ billDetail.send_at }}
        </el-descriptions-item>
        <el-descriptions-item label="支付时间">
          {{ billDetail.paid_at || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 课程信息 -->
    <el-card class="course-card" v-if="billDetail">
      <template #header>
        <div class="card-header">
          <h3>课程信息</h3>
        </div>
      </template>
      <el-descriptions :column="2">
        <el-descriptions-item label="课程名称">
          {{ billDetail.course.name }}
        </el-descriptions-item>
        <el-descriptions-item label="课程年月">
          {{ billDetail.course.year_month }}
        </el-descriptions-item>
        <el-descriptions-item label="任课教师">
          {{ billDetail.course.teacher_name }}
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
      <div class="pay-info" v-if="billDetail">
        <div class="info-row">
          <label>账单编号</label>
          <span>{{ billDetail.no || '-' }}</span>
        </div>
        <div class="info-row">
          <label>课程</label>
          <span>{{ billDetail.course.name }} ({{ billDetail.course.year_month }})</span>
        </div>
        <div class="info-row">
          <label>金额</label>
          <span class="price">¥{{ billDetail.amount }}</span>
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
