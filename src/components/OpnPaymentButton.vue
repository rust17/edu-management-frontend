<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import { paymentService } from '@/helpers/payment'
import request from '@/http/request'
import { paymentEndpoints } from '@/http/endpoints/payment'

interface Props {
  invoiceId: number
  amount: string
  description: string
  loading?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  onSuccess: () => {},
  onCancel: () => {}
})

const emit = defineEmits<{
  'update:loading': [value: boolean]
}>()

const handlePay = async () => {
  emit('update:loading', true)

  try {
    // 创建支付会话
    const token = await paymentService.createPayment({
      amount: parseFloat(props.amount) * 100, // 转换为最小货币单位
      currency: 'JPY',
      description: props.description
    })

    // 调用后端API处理支付
    await request.post(paymentEndpoints.omiseCard, {
      invoice_id: props.invoiceId,
      token
    })

    ElMessage.success('支付成功')
    props.onSuccess()
  } catch (error) {
    // 只有在非用户取消的情况下显示错误信息
    if (error instanceof Error && error.message === 'Payment cancelled') {
      ElMessage.warning('您取消了支付')
      props.onCancel()
    }
  } finally {
    emit('update:loading', false)
  }
}
</script>

<template>
  <el-button
    type="primary"
    :loading="loading"
    @click="handlePay"
  >
    Pay with Opn Payments
  </el-button>
</template>
