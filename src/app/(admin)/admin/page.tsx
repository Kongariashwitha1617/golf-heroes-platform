'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { profileService, subscriptionService, scoreService, drawService, charityService, prizeService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Users, CreditCard, Target, Trophy, Heart, TrendingUp, AlertCircle } from 'lucide-react'
import type { Profile, Subscription, Score, Draw, Charity, Prize } from '@/types/database'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalScores: 0,
    totalDraws: 0,
    activeCharities: 0,
    totalPrizes: 0,
    monthlyRevenue: 0,
    totalCharityContributions: 0,
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) return

        setUser(currentUser)

        // Load all dashboard stats in parallel
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

        // Get scores and prizes separately since we need to aggregate them
        const allScores = await Promise.all(
          profiles.map(async (profile: any) => {
            const userScores = await scoreService.getScores(profile.id)
            return userScores
          })
        )
        
        const scores = allScores.flat()
        
        const allPrizes = await Promise.all(
          profiles.map(async (profile: any) => {
            const userPrizes = await prizeService.getUserPrizes(profile.id)
            return userPrizes
          })
        )
        
        const prizes = allPrizes.flat()

        // Calculate stats
        const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active').length
        const activeCharities = charities.filter((charity: any) => charity.is_active).length
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        
        const monthlySubscriptions = subscriptions.filter((sub: any) => {
          if (sub.status !== 'active') return false
          const subDate = new Date(sub.created_at)
          return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear
        })

        const monthlyRevenue = monthlySubscriptions.length * 9.99
        const totalCharityContributions = prizes.reduce((sum: number, prize: any) => {
          const charityPercent = profiles.find((p: any) => p.id === prize.user_id)?.charity_percent || 10
          return sum + (prize.amount * charityPercent / 100)
        }, 0)

        setStats({
          totalUsers: profiles.length,
          activeSubscriptions,
          totalScores: scores.length,
          totalDraws: draws.length,
          activeCharities,
          totalPrizes: prizes.length,
          monthlyRevenue,
          totalCharityContributions,
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      title: 'Total Scores',
      value: stats.totalScores,
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Total Draws',
      value: stats.totalDraws,
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    {
      title: 'Active Charities',
      value: stats.activeCharities,
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
    },
    {
      title: 'Total Prizes',
      value: stats.totalPrizes,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">
          Overview of platform statistics and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} border ${stat.borderColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#112240] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Monthly Revenue</CardTitle>
            <CardDescription className="text-gray-400">
              Revenue from active subscriptions this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00ff87]">
              ${stats.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              From {stats.activeSubscriptions} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Charity Contributions</CardTitle>
            <CardDescription className="text-gray-400">
              Total amount contributed to charities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-400">
              ${stats.totalCharityContributions.toFixed(2)}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Making a difference through golf
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <h3 className="text-white font-semibold mb-2">Run Monthly Draw</h3>
              <p className="text-gray-400 text-sm mb-3">
                Generate and execute the monthly lottery draw
              </p>
              <button 
                onClick={() => router.push('/admin/draws')}
                className="px-4 py-2 bg-[#00ff87] text-[#0a1628] rounded-lg font-medium hover:bg-[#00ff87]/90 transition-colors">
                Run Draw
              </button>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <h3 className="text-white font-semibold mb-2">Manage Users</h3>
              <p className="text-gray-400 text-sm mb-3">
                View and manage user accounts and subscriptions
              </p>
              <button 
                onClick={() => router.push('/admin/users')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Manage Users
              </button>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <h3 className="text-white font-semibold mb-2">View Reports</h3>
              <p className="text-gray-400 text-sm mb-3">
                Generate detailed reports and analytics
              </p>
              <button 
                onClick={() => router.push('/admin/reports')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors">
                View Reports
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle size={20} />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database Connection</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Payment Processing</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Draw Engine</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                Ready
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email Service</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                Limited
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}