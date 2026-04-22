'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, profileService, subscriptionService } from '@/lib/supabase'
import type { Profile, Subscription } from '@/types/database'

interface UseUserReturn {
  user: Profile | null
  subscription: Subscription | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // FETCH USER AND SUBSCRIPTION DATA
  // ============================================

  const fetchUserAndSubscription = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profile
      const profile = await profileService.getProfile(userId)
      setUser(profile)

      if (profile) {
        // Fetch subscription
        const sub = await subscriptionService.getSubscription(userId)
        setSubscription(sub)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================
  // INITIALIZE ON MOUNT
  // ============================================

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Get current authenticated user
        const { data: authData } = await supabase.auth.getUser()
        if (authData.user) {
          await fetchUserAndSubscription(authData.user.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error initializing user:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize user')
        setLoading(false)
      }
    }

    initializeUser()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserAndSubscription(session.user.id)
      } else {
        setUser(null)
        setSubscription(null)
        setLoading(false)
      }
    })

    return () => {
      // Clean up auth subscription
      subscription?.unsubscribe?.()
    }
  }, [fetchUserAndSubscription])

  // ============================================
  // UPDATE PROFILE
  // ============================================

  const updateProfile = useCallback(
    async (updates: Partial<Profile>): Promise<boolean> => {
      if (!user) return false

      try {
        const updated = await profileService.updateProfile(user.id, updates)
        if (updated) {
          setUser(updated)
          return true
        }
        return false
      } catch (err) {
        console.error('Error updating profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to update profile')
        return false
      }
    },
    [user]
  )

  // ============================================
  // REFETCH
  // ============================================

  const refetch = useCallback(async () => {
    if (user) {
      await fetchUserAndSubscription(user.id)
    }
  }, [user, fetchUserAndSubscription])

  return {
    user,
    subscription,
    loading,
    error,
    refetch,
    updateProfile,
  }
}
