/**
 * 账单状态
 */
export type InvoiceStatus = 'pending' | 'paid' | 'failed'

/**
 * 账单的状态标签
 */
interface StatusTag {
  type: 'warning' | 'success' | 'danger' | 'info'
  label: string
}

/**
 * 获取账单状态显示
 * @param status 账单状态
 * @returns 状态显示
 */
export const getBillStatusTag = (status: InvoiceStatus | undefined): StatusTag => {
  const statusMap: Record<InvoiceStatus, StatusTag> = {
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
  return status ? statusMap[status] : {
    type: 'info',
    label: '未知状态'
  }
}
