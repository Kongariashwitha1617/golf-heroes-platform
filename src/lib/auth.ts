import { supabase } from '@/lib/supabase'
import type { AuthSession } from '@/types'

/**
 * Authentication utilities for client-side operations
 */

// ============================================
// USER AUTHENTICATION
// ============================================

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) {
      if (error.status === 429 || 
          error.message?.toLowerCase().includes('rate limit') ||
          error.message?.toLowerCase().includes('too many requests')) {
        return {
          success: false,
          error: 'Too many attempts. Please wait 5 minutes and try again.'
        }
      }
      if (error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('already exists')) {
        return {
          success: false,
          error: 'Account already exists. Please login instead.'
        }
      }
      return { success: false, error: error.message }
    }

    return {
      success: true,
      userId: data.user?.id,
      user: data.user
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Signup failed. Please try again.'
    }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message?.toLowerCase().includes('invalid login') ||
          error.message?.toLowerCase().includes('invalid credentials')) {
        return { success: false, error: 'Invalid email or password.' }
      }
      if (error.status === 429 ||
          error.message?.toLowerCase().includes('rate limit')) {
        return { success: false, error: 'Too many attempts. Please wait 5 minutes.' }
      }
      return { success: false, error: error.message }
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Login failed. Please try again.'
    }
  }
}

export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: 'Sign out failed' }
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      return null
    }

    return data.user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function getSession(): Promise<AuthSession | null> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      return null
    }

    return {
      user: {
        id: data.session.user.id,
        email: data.session.user.email || '',
        user_metadata: data.session.user.user_metadata,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token || '',
      },
    }
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, session: data.session }
  } catch (error) {
    console.error('Refresh session error:', error)
    return { success: false, error: 'Session refresh failed' }
  }
}

// ============================================
// PASSWORD RESET
// ============================================

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { success: false, error: 'Failed to send reset email' }
  }
}

export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Update password error:', error)
    return { success: false, error: 'Failed to update password' }
  }
}

// ============================================
// EMAIL VERIFICATION
// ============================================

export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Resend verification error:', error)
    return { success: false, error: 'Failed to resend email' }
  }
}

// ============================================
// AUTH STATE SUBSCRIPTION
// ============================================

export function onAuthStateChange(callback: (user: any | null) => void) {
  const { data: subscription } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user || null)
    }
  )

  return subscription
}
