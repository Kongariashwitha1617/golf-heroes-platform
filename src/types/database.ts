// Type definitions for user roles, statuses, and plans
export type UserRole = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type DrawStatus = 'pending' | 'simulated' | 'published'
export type PrizeStatus = 'pending' | 'paid'
export type ProofStatus = 'pending' | 'approved' | 'rejected'
export type PrizeTier = 3 | 4 | 5
export type DrawLogicType = 'random' | 'algorithmic'

// Database table interfaces
export interface Profile {
  id: string // UUID, references auth.users
  full_name: string
  email: string
  role: UserRole
  charity_id: string | null
  charity_percent: number // 10-100, default 10
  created_at: string // timestamp with time zone
  updated_at: string // timestamp with time zone
}

export interface Subscription {
  id: string // UUID
  user_id: string // UUID, references profiles
  stripe_subscription_id: string
  stripe_customer_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  renewal_date: string // timestamp with time zone
  created_at: string
  updated_at: string
}

export interface Score {
  id: string // UUID
  user_id: string // UUID, references profiles
  score_value: number // 1-45 (Stableford format)
  score_date: string // date, unique per user
  created_at: string
  updated_at: string
}

export interface Charity {
  id: string // UUID
  name: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Draw {
  id: string // UUID
  month: number // 1-12
  year: number // 2026
  status: DrawStatus // 'pending' | 'simulated' | 'published'
  draw_numbers: number[] // Array of 5 numbers 1-45
  jackpot_rollover: number // numeric, default 0.00
  total_pool: number // numeric, calculated from active subscriptions
  created_at: string // timestamp with time zone
  updated_at: string // timestamp with time zone
}

export interface PrizePool {
  id: string // UUID
  draw_id: string // UUID, references draws
  total_pool: number
  tier_5_amount: number // 40% of total_pool
  tier_4_amount: number // 35% of total_pool
  tier_3_amount: number // 25% of total_pool
  created_at: string
}

export interface DrawEntry {
  id: string // UUID
  draw_id: string // UUID, references draws
  user_id: string // UUID, references profiles
  matched_numbers: number[] // Numbers that matched in the draw
  match_count: number // 0-5
  created_at: string
}

export interface Prize {
  id: string // UUID
  draw_id: string // UUID, references draws
  user_id: string // UUID, references profiles
  tier: PrizeTier // 3, 4, or 5
  amount: number
  status: PrizeStatus
  created_at: string
  updated_at: string
}

export interface WinnerProof {
  id: string // UUID
  prize_id: string // UUID, references prizes
  user_id: string // UUID, references profiles
  file_url: string // S3/CDN URL
  admin_status: ProofStatus
  admin_notes: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null // UUID of admin who reviewed
}

// Extended/computed interfaces for API responses
export interface ProfileWithSubscription extends Profile {
  subscription?: Subscription | null
}

export interface UserScores extends Profile {
  scores: Score[]
}

export interface DrawWithPrizes extends Draw {
  prizes?: Prize[]
  prize_pools?: PrizePool
  draw_entries?: DrawEntry[]
}

export interface PrizeWithProof extends Prize {
  winner_proof?: WinnerProof | null
  user?: Profile
}

// Request/Response DTOs
export interface SubscribeRequest {
  email: string
  full_name: string
  charity_id: string
  charity_percent?: number
  plan: SubscriptionPlan
}

export interface ScoreEntryRequest {
  score_value: number
  score_date: string
}

export interface DrawConfigRequest {
  month: number
  year: number
  logic_type: DrawLogicType // 'random' or 'algorithmic'
}

export interface ProofVerificationRequest {
  status: Exclude<ProofStatus, 'pending'>
  admin_notes?: string
}

// Pagination helper
export interface PaginationParams {
  limit?: number
  offset?: number
  order_by?: string
  order?: 'asc' | 'desc'
}

// Database response with count
export interface ListResponse<T> {
  data: T[]
  count: number
  total: number
}

// Statistics interfaces
export interface DrawStats {
  total_participants: number
  total_pool: number
  tier_3_winners: number
  tier_4_winners: number
  tier_5_winners: number
  tier_3_per_winner: number
  tier_4_per_winner: number
  tier_5_per_winner: number
}