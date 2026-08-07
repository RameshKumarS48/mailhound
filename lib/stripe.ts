import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
})

export const CREDIT_PACKS = [
  { id: 'pack_1k',   credits: 1_000,   price: 500,   label: '1,000 credits'   },
  { id: 'pack_5k',   credits: 5_000,   price: 2000,  label: '5,000 credits'   },
  { id: 'pack_10k',  credits: 10_000,  price: 3500,  label: '10,000 credits'  },
  { id: 'pack_25k',  credits: 25_000,  price: 7500,  label: '25,000 credits'  },
  { id: 'pack_50k',  credits: 50_000,  price: 13000, label: '50,000 credits'  },
  { id: 'pack_100k', credits: 100_000, price: 22000, label: '100,000 credits' },
] as const

export type PackId = typeof CREDIT_PACKS[number]['id']
