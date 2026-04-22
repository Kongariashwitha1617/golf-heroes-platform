'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { scoreService, subscriptionService, drawService, profileService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Score, Subscription, Draw, Profile } from '@/types/database'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    myScores: 0,
    activeDraws: 0,
    charityContributions: 0,
    subscriptionPlan: 'No Active Plan',
    drawsWon: 0,
    leaderboardRank: 0
  })
  const [recentScores, setRecentScores] = useState<Score[]>([])
  const [upcomingDraws, setUpcomingDraws] = useState<Draw[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) return

        setUser(currentUser)

        // Load user's scores
        const scores = await scoreService.getScores(currentUser.id)
        setRecentScores(scores.slice(-5).reverse())

        // Load user's subscription
        const subscriptions = await subscriptionService.getActiveSubscriptions()
        const userSubscription = subscriptions.find((sub: any) => sub.user_id === currentUser.id)
        
        // Load all draws
        const allDraws = await drawService.getPublishedDraws()
        const activeDraws = allDraws.filter((draw: any) => draw.status === 'published')
        setUpcomingDraws(activeDraws.slice(0, 5))

        // Calculate stats
        const monthlyRevenue = userSubscription ? 9.99 : 0
        const charityContributions = userSubscription ? (monthlyRevenue * 0.1) : 0

        setStats({
          myScores: scores.length,
          activeDraws: activeDraws.length,
          charityContributions: charityContributions,
          subscriptionPlan: userSubscription ? `${userSubscription.plan.charAt(0).toUpperCase() + userSubscription.plan.slice(1)} Plan` : 'No Active Plan',
          drawsWon: 0, // TODO: Calculate from wins table when available
          leaderboardRank: 0 // TODO: Calculate from score rankings when available
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" variant="white" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {user?.full_name || user?.email}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Scores */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">My Scores</CardTitle>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{stats.myScores}</div>
            <p className="text-sm text-gray-400 mt-1">Scores submitted</p>
          </CardContent>
        </Card>

        {/* Active Draws */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Active Draws</CardTitle>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.activeDraws}</div>
            <p className="text-sm text-gray-400 mt-1">Currently entered</p>
          </CardContent>
        </Card>

        {/* Charity Contributions */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Charity Contributions</CardTitle>
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-400">${stats.charityContributions.toFixed(2)}</div>
            <p className="text-sm text-gray-400 mt-1">Total contributed</p>
          </CardContent>
        </Card>

        {/* My Subscription */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">My Subscription</CardTitle>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-400">{stats.subscriptionPlan}</div>
            <p className="text-sm text-gray-400 mt-1">Current plan</p>
          </CardContent>
        </Card>

        {/* Draws Won */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Draws Won</CardTitle>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{stats.drawsWon}</div>
            <p className="text-sm text-gray-400 mt-1">Total wins</p>
          </CardContent>
        </Card>

        {/* Leaderboard Rank */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-300">Leaderboard Rank</CardTitle>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {stats.leaderboardRank > 0 ? `#${stats.leaderboardRank}` : 'N/A'}
            </div>
            <p className="text-sm text-gray-400 mt-1">Current rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scores */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Scores</CardTitle>
            <CardDescription className="text-gray-400">Your latest golf scores</CardDescription>
          </CardHeader>
          <CardContent>
            {recentScores.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No scores recorded yet</p>
            ) : (
              <div className="space-y-3">
                {recentScores.map((score) => (
                  <div key={score.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <div className="font-medium text-white">Score: {score.score_value}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(score.score_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-purple-400 font-bold">{score.score_value}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Draws */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Draws</CardTitle>
            <CardDescription className="text-gray-400">Active draws you can enter</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDraws.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No active draws available</p>
            ) : (
              <div className="space-y-3">
                {upcomingDraws.map((draw) => (
                  <div key={draw.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <div className="font-medium text-white">{draw.month}/{draw.year} Draw</div>
                      <div className="text-sm text-gray-400">
                        Pool: ${draw.total_pool.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-yellow-400 font-bold">{draw.draw_numbers.length} numbers</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
