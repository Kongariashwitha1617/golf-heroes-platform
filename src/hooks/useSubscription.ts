'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscriptionService } from '@/lib/supabase'
import { getSubscriptionInfo, isSubscriptionActive } from '@/lib/utils'
import type { Subscription } from '@/types/database'

interface UseSubscriptionReturn {
  subscription: Subscription | null
  loading: boolean
  error: string | null
  isActive: boolean
  renewalInfo: {
    daysUntilRenewal: number
    renewalFormatted: string
    isRenewingSoon: boolean
  } | null
  refetch: () => Promise<void>
}

export function useSubscription(userId: string | null): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // FETCH SUBSCRIPTION
  // ============================================

  const fetchSubscription = useCallback(async (uId: string) => {
    try {
      setLoading(true)
      setError(null)
      const sub = await subscriptionService.getSubscription(uId)
      setSubscription(sub)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================
  // INITIALIZE ON MOUNT
  // ============================================

  useEffect(() => {
    if (userId) {
      fetchSubscription(userId)

      // Refresh subscription every 5 minutes to check status changes
      const interval = setInterval(() => {
        fetchSubscription(userId)
      }, 5 * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [userId, fetchSubscription])

  // ============================================
  // REFETCH
  // ============================================

  const refetch = useCallback(async () => {
    if (userId) {
      await fetchSubscription(userId)
    }
  }, [userId, fetchSubscription])

  // ============================================
  // COMPUTE DERIVED STATE
  // ============================================

  const isActive = subscription ? isSubscriptionActive(subscription.status) : false

  const renewalInfo = subscription
    ? getSubscriptionInfo(subscription.renewal_date)
    : null

  return {
    subscription,
    loading,
    error,
    isActive,
    renewalInfo,
    refetch,
  }
}
