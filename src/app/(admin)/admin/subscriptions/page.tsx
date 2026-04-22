'use client'

import { useState, useEffect } from 'react'
import { subscriptionService, profileService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CreditCard, Users, TrendingUp, Calendar } from 'lucide-react'
import type { Subscription, Profile } from '@/types/database'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subsData, profilesData] = await Promise.all([
          subscriptionService.getActiveSubscriptions(),
          profileService.getAllProfiles(),
        ])
        setSubscriptions(subsData)
        setProfiles(profilesData)
      } catch (err) {
        console.error('Error loading subscriptions:', err)
        setError('Failed to load subscriptions')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId)
    return profile?.full_name || profile?.email || 'Unknown User'
  }

  const getUserEmail = (userId: string) => {
    const profile = profiles.find(p => p.id === userId)
    return profile?.email || ''
  }

  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'active' && s.plan === 'monthly')
    .length * 9.99

  const yearlyRevenue = subscriptions
    .filter(s => s.status === 'active' && s.plan === 'yearly')
    .length * 99.99

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" variant="white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
        <p className="text-gray-400">Manage user subscriptions and billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Active</CardTitle>
            <CreditCard className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Plans</CardTitle>
            <Calendar className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {subscriptions.filter(s => s.plan === 'monthly').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Yearly Plans</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {subscriptions.filter(s => s.plan === 'yearly').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Monthly Revenue</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              ${(monthlyRevenue + yearlyRevenue).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Subscriptions ({subscriptions.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Active and inactive user subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium text-gray-300">User</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Plan</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Amount</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Started</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Renews</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">{getUserName(sub.user_id)}</div>
                          <div className="text-xs text-gray-400">{getUserEmail(sub.user_id)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium">
                          {sub.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          sub.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">
                        {sub.plan === 'monthly' ? '$9.99/mo' : '$99.99/yr'}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {sub.renewal_date
                          ? new Date(sub.renewal_date).toLocaleDateString()
                          : '---'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
