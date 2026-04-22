// Re-export all database types
export * from './database'

// API request/response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  status: number
  code: string
  message: string
  details?: Record<string, any>
}

// Authentication types
export interface AuthSession {
  user: {
    id: string
    email: string
    user_metadata?: Record<string, any>
  }
  session: {
    access_token: string
    refresh_token: string
  }
}

// UI State types
export interface loadingState {
  isLoading: boolean
  error: string | null
  data: any | null
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  timestamp: number
  duration?: number
}

// Draw statistics
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

// Charity stats
export interface CharityStats {
  charity_id: string
  charity_name: string
  total_contributed: number
  subscriber_count: number
  average_contribution: number
}

// User dashboard summary
export interface DashboardSummary {
  profile: import('./database').Profile
  subscription: import('./database').Subscription | null
  recent_scores: import('./database').Score[]
  next_draw: import('./database').Draw | null
  total_winnings: number
  pending_prizes: import('./database').Prize[]
  charity_selection: {
    charity_id: string
    charity_name: string
    percentage: number
  }
}

// Admin dashboard summary
export interface AdminDashboardSummary {
  total_users: number
  active_subscribers: number
  total_prize_pool: number
  upcoming_draw: import('./database').Draw | null
  pending_verifications: number
  charity_contributions: CharityStats[]
}

// Stripe types
export interface StripeCheckoutSession {
  stripe_session_id: string
  url: string
  expires_at: number
}

export interface StripeWebhookEvent {
  id: string
  type: string
  created: number
  data: {
    object: Record<string, any>
    previous_attributes?: Record<string, any>
  }
}
