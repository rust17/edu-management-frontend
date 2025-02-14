declare global {
  var OmiseCard: {
    configure: (config: { publicKey: string }) => void;
    open: (config: any) => void;
  }
}

interface PaymentConfig {
  amount: number
  currency: string
  description?: string
}

// Global singleton loader
const globalOmiseScriptLoader = new Promise<void>((resolve, reject) => {
  if (typeof OmiseCard !== 'undefined') {
    OmiseCard.configure({ publicKey: import.meta.env.VITE_OMISE_PUBLIC_KEY })
    resolve()
    return
  }

  const script = document.createElement('script')
  script.id = 'omise-script'
  script.src = 'https://cdn.omise.co/omise.js'
  script.async = true

  script.onload = () => {
    if (typeof OmiseCard === 'undefined') {
      reject(new Error('Omise script loaded but OmiseCard is undefined'))
      return
    }

    OmiseCard.configure({ publicKey: import.meta.env.VITE_OMISE_PUBLIC_KEY })
    resolve()
  }

  script.onerror = () => {
    reject(new Error('Failed to load Omise script'))
  }

  document.head.appendChild(script)
})

export class PaymentService {
  async createPayment(config: PaymentConfig): Promise<string> {
    await globalOmiseScriptLoader

    return new Promise((resolve, reject) => {
      OmiseCard.open({
        amount: config.amount,
        currency: config.currency,
        defaultPaymentMethod: 'credit_card',
        description: config.description,
        onCreateTokenSuccess: (token: string) => {
          resolve(token)
        },
        onError: (error: any) => {
          reject(error)
        },
        onFormClosed: () => {
          reject(new Error('Payment cancelled'))
        }
      })
    })
  }
}

export const paymentService = new PaymentService()
