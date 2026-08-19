import DodoPayments from 'dodopayments'

export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
})

// After creating products in the Dodo dashboard, set each product ID as an env var.
export const CREDIT_PACKS = [
  { id: 'pack_1k',   productId: process.env.DODO_PRODUCT_ID_1K!,   credits: 1_000,   price: 500,   label: '1,000 credits'   },
  { id: 'pack_5k',   productId: process.env.DODO_PRODUCT_ID_5K!,   credits: 5_000,   price: 2000,  label: '5,000 credits'   },
  { id: 'pack_10k',  productId: process.env.DODO_PRODUCT_ID_10K!,  credits: 10_000,  price: 3500,  label: '10,000 credits'  },
  { id: 'pack_25k',  productId: process.env.DODO_PRODUCT_ID_25K!,  credits: 25_000,  price: 7500,  label: '25,000 credits'  },
  { id: 'pack_50k',  productId: process.env.DODO_PRODUCT_ID_50K!,  credits: 50_000,  price: 13000, label: '50,000 credits'  },
  { id: 'pack_100k', productId: process.env.DODO_PRODUCT_ID_100K!, credits: 100_000, price: 22000, label: '100,000 credits' },
] as const

export type PackId = typeof CREDIT_PACKS[number]['id']
