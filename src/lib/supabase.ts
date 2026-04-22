import { createClient } from '@supabase/supabase-js'
import type {
  Profile,
  Subscription,
  Score,
  Charity,
  Draw,
  Prize,
  WinnerProof,
  DrawEntry,
  PrizePool,
  ListResponse,
} from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// PROFILES
// ============================================

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }
    return data
  },

  async getProfileByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile by email:', error)
      return null
    }
    return data
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at'>): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      return data
    } catch (err: any) {
      console.error('Profile creation error:', err)
      return null
    }
  },

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    return data
  },

  async getAllProfiles(limit = 100): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(limit)

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }
    return data || []
  },
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export const subscriptionService = {
  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
    return data
  },

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching subscription by Stripe ID:', error)
      return null
    }
    return data
  },

  async createSubscription(
    subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }
    return data
  },

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription:', error)
      return null
    }
    return data
  },

  async getActiveSubscriptions(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching active subscriptions:', error)
      return []
    }
    return data || []
  },
}

// ============================================
// SCORES
// ============================================

export const scoreService = {
  async getScores(userId: string): Promise<Score[]> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('score_date', { ascending: false })

    if (error) {
      console.error('Error fetching scores:', error)
      return []
    }
    return data || []
  },

  async addScore(
    score: Omit<Score, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Score | null> {
    // Check for duplicate date
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', score.user_id)
      .eq('score_date', score.score_date)
      .maybeSingle()

    if (existing) {
      throw new Error('A score already exists for this date. Please edit or delete it.')
    }

    const { data, error } = await supabase
      .from('scores')
      .insert([score])
      .select()
      .single()

    if (error) {
      console.error('Error adding score:', error)
      return null
    }

    // Auto-delete oldest score if user has more than 5
    const allScores = await this.getScores(score.user_id)
    if (allScores.length > 5) {
      const oldestScore = allScores[allScores.length - 1]
      await this.deleteScore(oldestScore.id)
    }

    return data
  },

  async updateScore(
    scoreId: string,
    updates: Partial<Score>
  ): Promise<Score | null> {
    const { data, error } = await supabase
      .from('scores')
      .update(updates)
      .eq('id', scoreId)
      .select()
      .single()

    if (error) {
      console.error('Error updating score:', error)
      return null
    }
    return data
  },

  async deleteScore(scoreId: string): Promise<boolean> {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)

    if (error) {
      console.error('Error deleting score:', error)
      return false
    }
    return true
  },

  async getScoreByDate(
    userId: string,
    scoreDate: string
  ): Promise<Score | null> {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .eq('score_date', scoreDate)
      .maybeSingle()

    if (error) {
      console.error('Error fetching score by date:', error)
      return null
    }
    return data
  },
}

// ============================================
// CHARITIES
// ============================================

export const charityService = {
  async getCharities(onlyActive = true): Promise<Charity[]> {
    try {
      let query = supabase.from('charities').select('*')

      if (onlyActive) {
        query = query.eq('is_active', true)
      }

      query = query
        .order('is_featured', { ascending: false })
        .order('name')

      const { data, error } = await query

      if (error) {
        console.error('Error fetching charities:', error)
        return []
      }

      if (data && data.length > 0) {
        return data
      }

      return []
    } catch (err) {
      console.error('Error fetching charities:', err)
      return []
    }
  },

  async getCharity(charityId: string): Promise<Charity | null> {
    console.log('getCharity called with ID:', charityId)
    
    if (!charityId) {
      console.log('getCharity: charityId is null/undefined')
      return null
    }

    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', charityId)
      .maybeSingle()

    console.log('getCharity result:', { data, error })

    if (error) {
      console.error('Error fetching charity:', error)
      if (error.code === 'PGRST116') {
        console.log('Charity not found with ID:', charityId)
      }
      return null
    }
    
    console.log('getCharity returning data:', data)
    return data
  },

  async createCharity(
    charity: Omit<Charity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Charity | null> {
    const { data, error } = await supabase
      .from('charities')
      .insert([charity])
      .select()
      .single()

    if (error) {
      console.error('Error creating charity:', error)
      return null
    }
    return data
  },

  async updateCharity(
    charityId: string,
    updates: Partial<Charity>
  ): Promise<Charity | null> {
    const { data, error } = await supabase
      .from('charities')
      .update(updates)
      .eq('id', charityId)
      .select()
      .single()

    if (error) {
      console.error('Error updating charity:', error)
      return null
    }
    return data
  },

  async getFeaturedCharities(): Promise<Charity[]> {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching featured charities:', error)
      return []
    }
    return data || []
  },

  async deleteCharity(charityId: string): Promise<boolean> {
    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', charityId)

    if (error) {
      console.error('Error deleting charity:', error)
      return false
    }
    return true
  },
}

// ============================================
// DRAWS
// ============================================

export const drawService = {
  async getDraw(drawId: string): Promise<Draw | null> {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching draw:', error)
      return null
    }
    return data
  },

  async getDrawByMonthYear(
    month: number,
    year: number
  ): Promise<Draw | null> {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .maybeSingle()

    if (error) {
      console.error('Error fetching draw:', error)
      return null
    }
    return data
  },

  async createDraw(
    draw: Omit<Draw, 'id' | 'created_at'>
  ): Promise<Draw | null> {
    const { data, error } = await supabase
      .from('draws')
      .insert([draw])
      .select()
      .single()

    if (error) {
      console.error('Error creating draw:', error)
      return null
    }
    return data
  },

  async updateDraw(
    drawId: string,
    updates: Partial<Draw>
  ): Promise<Draw | null> {
    const { data, error } = await supabase
      .from('draws')
      .update(updates)
      .eq('id', drawId)
      .select()
      .single()

    if (error) {
      console.error('Error updating draw:', error)
      return null
    }
    return data
  },

  async getPublishedDraws(limit = 12): Promise<Draw[]> {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching published draws:', error)
      return []
    }
    return data || []
  },

  async getLatestPublishedDraw(): Promise<Draw | null> {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching latest draw:', error)
      return null
    }
    return data
  },

  async getNextUpcomingDraw(): Promise<Draw | null> {
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .in('status', ['pending', 'simulated'])
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching upcoming draw:', error)
      return null
    }
    return data
  },
}

// ============================================
// PRIZES
// ============================================

export const prizeService = {
  async getPrize(prizeId: string): Promise<Prize | null> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('id', prizeId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching prize:', error)
      return null
    }
    return data
  },

  async getUserPrizes(userId: string): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user prizes:', error)
      return []
    }
    return data || []
  },

  async createPrize(
    prize: Omit<Prize, 'id' | 'created_at'>
  ): Promise<Prize | null> {
    const { data, error } = await supabase
      .from('prizes')
      .insert([prize])
      .select()
      .single()

    if (error) {
      console.error('Error creating prize:', error)
      return null
    }
    return data
  },

  async updatePrize(
    prizeId: string,
    updates: Partial<Prize>
  ): Promise<Prize | null> {
    const { data, error } = await supabase
      .from('prizes')
      .update(updates)
      .eq('id', prizeId)
      .select()
      .single()

    if (error) {
      console.error('Error updating prize:', error)
      return null
    }
    return data
  },

  async getDrawPrizes(drawId: string): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('draw_id', drawId)

    if (error) {
      console.error('Error fetching draw prizes:', error)
      return []
    }
    return data || []
  },

  async getUserPendingPrizes(userId: string): Promise<Prize[]> {
    const { data, error } = await supabase
      .from('prizes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (error) {
      console.error('Error fetching pending prizes:', error)
      return []
    }
    return data || []
  },
}

// ============================================
// WINNER PROOFS
// ============================================

export const proofService = {
  async getProof(proofId: string): Promise<WinnerProof | null> {
    const { data, error } = await supabase
      .from('winner_proofs')
      .select('*')
      .eq('id', proofId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching proof:', error)
      return null
    }
    return data
  },

  async getProofByPrize(prizeId: string): Promise<WinnerProof | null> {
    const { data, error } = await supabase
      .from('winner_proofs')
      .select('*')
      .eq('prize_id', prizeId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching proof by prize:', error)
      return null
    }
    return data
  },

  async submitProof(
    proof: Omit<WinnerProof, 'id' | 'submitted_at'>
  ): Promise<WinnerProof | null> {
    const { data, error } = await supabase
      .from('winner_proofs')
      .insert([proof])
      .select()
      .single()

    if (error) {
      console.error('Error submitting proof:', error)
      return null
    }
    return data
  },

  async reviewProof(
    proofId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    notes?: string
  ): Promise<WinnerProof | null> {
    const { data, error } = await supabase
      .from('winner_proofs')
      .update({
        admin_status: status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes,
      })
      .eq('id', proofId)
      .select()
      .single()

    if (error) {
      console.error('Error reviewing proof:', error)
      return null
    }
    return data
  },

  async getPendingProofs(): Promise<WinnerProof[]> {
    const { data, error } = await supabase
      .from('winner_proofs')
      .select('*')
      .eq('admin_status', 'pending')
      .order('submitted_at', { ascending: true })

    if (error) {
      console.error('Error fetching pending proofs:', error)
      return []
    }
    return data || []
  },
}