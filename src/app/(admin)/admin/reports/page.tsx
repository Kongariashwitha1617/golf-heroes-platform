'use client'

import { useState, useEffect } from 'react'
import { profileService, subscriptionService, scoreService, drawService, charityService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Profile, Subscription } from '@/types/database'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total_users: 0,
    active_subscriptions: 0,
    new_signups_today: 0,
    revenue_this_month: 0,
    total_scores: 0,
    total_draws: 0,
    active_charities: 0
  })

  // Load real data
  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        
        // Load all real data in parallel
        const [
          profiles,
          subscriptions,
          draws,
          charities,
        ] = await Promise.all([
          profileService.getAllProfiles(),
          subscriptionService.getActiveSubscriptions(),
          drawService.getPublishedDraws(),
          charityService.getCharities(),
        ])

        // Get scores separately
        const allScores = await Promise.all(
          profiles.map(async (profile) => {
            const userScores = await scoreService.getScores(profile.id)
            return userScores
          })
        )
        const scores = allScores.flat()

        // Calculate real stats
        const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active').length
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        const monthlySubscriptions = subscriptions.filter((sub: any) => {
          if (sub.status !== 'active') return false
          const subDate = new Date(sub.created_at)
          return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear
        })

        const newSignupsToday = profiles.filter((profile: any) => {
          const today = new Date()
          const createdDate = new Date(profile.created_at)
          return createdDate.toDateString() === today.toDateString()
        }).length

        const monthlyRevenue = monthlySubscriptions.length * 9.99
        const activeCharities = charities.filter((charity: any) => charity.is_active).length

        const realStats = {
          total_users: profiles.length,
          active_subscriptions: activeSubscriptions,
          new_signups_today: newSignupsToday,
          revenue_this_month: monthlyRevenue,
          total_scores: scores.length,
          total_draws: draws.length,
          active_charities: activeCharities
        }

        setStats(realStats)
        
        // Create report data
        const reportData = [
          {
            id: '1',
            type: 'user_activity',
            title: 'User Activity Report',
            data: realStats,
            created_at: new Date().toISOString()
          }
        ]
        setReports(reportData)
      } catch (err) {
        console.error('Error loading reports:', err)
        setError('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button onClick={() => window.location.reload()}>
          Generate Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Statistics</CardTitle>
          <CardDescription>Platform overview and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.total_users}</p>
              <p className="text-sm text-gray-500 mt-1">Registered accounts on platform</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Active Subscriptions</h3>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.active_subscriptions}</p>
              <p className="text-sm text-gray-500 mt-1">Currently paying subscribers</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue</h3>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">${stats.revenue_this_month.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Revenue from current month subscriptions</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">New Signups Today</h3>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.new_signups_today}</p>
              <p className="text-sm text-gray-500 mt-1">Users who registered today</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Total Golf Scores</h3>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.total_scores}</p>
              <p className="text-sm text-gray-500 mt-1">All golf scores recorded by players</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Total Draws</h3>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.total_draws}</p>
              <p className="text-sm text-gray-500 mt-1">Published golf lottery draws</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}