/**
 * Invoice status
 */
export type InvoiceStatus = 'pending' | 'paid' | 'failed'

/**
 * Status tag for invoice
 */
interface StatusTag {
  type: 'warning' | 'success' | 'danger' | 'info'
  label: string
}

/**
 * Get invoice status display
 * @param status Invoice status
 * @returns Status display
 */
export const getBillStatusTag = (status: InvoiceStatus | undefined): StatusTag => {
  const statusMap: Record<InvoiceStatus, StatusTag> = {
    pending: {
      type: 'warning',
      label: 'Pending'
    },
    paid: {
      type: 'success',
      label: 'Paid'
    },
    failed: {
      type: 'danger',
      label: 'Failed'
    }
  }
  return status ? statusMap[status] : {
    type: 'info',
    label: 'Unknown status'
  }
}
