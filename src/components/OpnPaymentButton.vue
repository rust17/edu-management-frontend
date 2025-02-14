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
    // Create payment session
    const token = await paymentService.createPayment({
      amount: parseFloat(props.amount) * 100, // Convert to smallest currency unit
      currency: 'JPY', // Use JPY as the settlement currency
      description: props.description
    })

    // Call backend API to process payment
    await request.post(paymentEndpoints.omiseCard, {
      invoice_id: props.invoiceId,
      token
    })

    ElMessage.success('Payment successful')
    props.onSuccess()
  } catch (error) {
    // Only show error message if it's not a user cancellation
    if (error instanceof Error && error.message === 'Payment cancelled') {
      ElMessage.warning('Payment cancelled by user')
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
