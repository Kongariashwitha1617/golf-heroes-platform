'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/auth'
import { supabase, charityService, profileService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Charity } from '@/types/database'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'info' | 'charity'>('info')
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCharities, setLoadingCharities] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedCharity, setSelectedCharity] = useState<string>('')
  const [charityPercent, setCharityPercent] = useState(10)
  const [userId, setUserId] = useState<string | null>(null)

  // Load charities
  useEffect(() => {
    const loadCharities = async () => {
      try {
        const data = await charityService.getCharities(true)
        setCharities(data)
        if (data.length > 0) {
          setSelectedCharity(data[0].id)
        }
      } catch (err) {
        console.error('Error loading charities:', err)
      } finally {
        setLoadingCharities(false)
      }
    }

    loadCharities()
  }, [])

  // Step 1: Create account
  const handleAccountCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const result = await signUp(email, password, fullName)
    if (!result.success) {
      setError(result.error || 'Sign up failed')
      setLoading(false)
    } else {
      setUserId(result.userId || null)
      setStep('charity')
      setLoading(false)
    }
  }

  // Step 2: Select charity and create profile
  const handleCharitySelection = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedCharity) {
      setError('Please select a charity')
      return
    }

    if (charityPercent < 10 || charityPercent > 100) {
      setError('Charity percentage must be between 10% and 100%')
      return
    }

    if (!userId) {
      setError('User account not created properly. Please go back and try again.')
      return
    }

    setLoading(true)

    try {
      console.log('Creating profile with:', {
        id: userId,
        full_name: fullName,
        email,
        role: 'subscriber',
        charity_id: selectedCharity || null,
        charity_percent: charityPercent,
      })

      // Create profile with charity selection
      const profile = await profileService.createProfile({
        id: userId,
        full_name: fullName,
        email,
        role: 'subscriber',
        charity_id: selectedCharity || null,
        charity_percent: charityPercent,
      })

      console.log('Profile creation result:', profile)

      if (profile) {
        // Sign out auto-created session so user must log in manually
        await supabase.auth.signOut()
        router.push('/login?registered=true')
      } else {
        setError('Failed to create profile. Please try again.')
      }
    } catch (err) {
      console.error('Profile creation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during profile creation')
    } finally {
      setLoading(false)
    }
  }

  if (loadingCharities && step === 'charity') {
    return <LoadingSpinner fullScreen />
  }

  if (step === 'info') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>Join Golf Heroes and start playing for charity</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccountCreation} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="••••••"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="••••••"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              size="md"
              className="w-full"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Step 2: Charity selection
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Charity</CardTitle>
        <CardDescription>Choose where your contribution goes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCharitySelection} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="charity" className="block text-sm font-medium text-gray-700 mb-2">
              Featured Charities
            </label>
            <select
              id="charity"
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              disabled={loading}
            >
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCharity && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                {charities.find((c) => c.id === selectedCharity)?.description}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="percent" className="block text-sm font-medium text-gray-700 mb-2">
              Contribution Percentage: {charityPercent}%
            </label>
            <input
              id="percent"
              type="range"
              min="10"
              max="100"
              value={charityPercent}
              onChange={(e) => setCharityPercent(Number(e.target.value))}
              className="w-full"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10% of your subscription goes to charity
            </p>
          </div>

          <Button
            type="submit"
            size="md"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Setting Up...' : 'Complete & Subscribe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
