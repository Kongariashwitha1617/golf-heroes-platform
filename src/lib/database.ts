export type UserRole = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'
export type DrawStatus = 'pending' | 'simulated' | 'published'
export type PrizeStatus = 'pending' | 'paid'
export type ProofStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  charity_id: string | null
  charity_percent: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  plan: 'monthly' | 'yearly'
  status: SubscriptionStatus
  renewal_date: string
  created_at: string
}

export interface Score {
  id: string
  user_id: string
  score_value: number
  score_date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  image_url: string
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export interface Draw {
  id: string
  month: number
  year: number
  status: DrawStatus
  draw_numbers: number[]
  jackpot_rollover: number
  total_pool: number
  created_at: string
}

export interface Prize {
  id: string
  draw_id: string
  user_id: string
  tier: 3 | 4 | 5
  amount: number
  status: PrizeStatus
  created_at: string
}

export interface WinnerProof {
  id: string
  prize_id: string
  user_id: string
  file_url: string
  admin_status: ProofStatus
  submitted_at: string
}
