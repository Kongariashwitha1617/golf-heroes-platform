'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { profileService, subscriptionService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Users, CreditCard, Search, Filter, MoreHorizontal, Mail, Shield, Ban } from 'lucide-react'
import type { Profile, Subscription } from '@/types/database'

export default function AdminUsers() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<Profile[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'subscriber' | 'admin'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        setCurrentUser(user)

        // Load users and subscriptions in parallel
        const [usersData, subscriptionsData] = await Promise.all([
          profileService.getAllProfiles(),
          subscriptionService.getActiveSubscriptions(),
        ])

        setUsers(usersData)
        setSubscriptions(subscriptionsData)
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const userSubscription = subscriptions.find(sub => sub.user_id === user.id)
    const isActive = userSubscription?.status === 'active'
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && isActive) || (filterStatus === 'inactive' && !isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getUserSubscription = (userId: string) => {
    return subscriptions.find(sub => sub.user_id === userId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" variant="white" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">
            Manage user accounts and subscriptions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="subscriber">Subscribers</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Total registered users and their subscription status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium text-gray-300">User</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Subscription</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const subscription = getUserSubscription(user.id)
                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                            <Users className="text-[#00ff87]" size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.full_name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const userSubscription = getUserSubscription(user.id)
                          const isActive = userSubscription?.status === 'active'
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isActive 
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {subscription ? (
                          <div className="flex items-center gap-2">
                            <CreditCard className="text-green-400" size={16} />
                            <span className="text-green-400">
                              {subscription.plan} - ${subscription.plan === 'monthly' ? '9.99/mo' : '99.99/yr'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No subscription</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                            className="text-xs"
                          >
                            <MoreHorizontal size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#112240] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Full Name</p>
                  <p className="text-white font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Role</p>
                  <p className="text-white font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  {(() => {
                    const userSubscription = getUserSubscription(selectedUser.id)
                    const isActive = userSubscription?.status === 'active'
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    )
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Charity</p>
                  <p className="text-white font-medium">
                    {selectedUser.charity_id ? 'Selected' : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Charity %</p>
                  <p className="text-white font-medium">{selectedUser.charity_percent || 10}%</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Subscription</p>
                <p className="text-white font-medium">
                  {(() => {
                    const sub = getUserSubscription(selectedUser.id)
                    if (!sub) return 'No subscription'
                    return `${sub.plan} - ${sub.plan === 'monthly' ? '$9.99/mo' : '$99.99/yr'}`
                  })()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Member Since</p>
                <p className="text-white font-medium">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setSelectedUser(null)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}