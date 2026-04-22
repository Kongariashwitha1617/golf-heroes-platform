'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { profileService, charityService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { Heart, Edit2, TrendingUp } from 'lucide-react'
import type { Profile, Charity } from '@/types/database'

export default function CharityPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [charityPercent, setCharityPercent] = useState(10)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadCharityData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Load profile and charities in parallel
        const [profileData, charitiesData] = await Promise.all([
          profileService.getProfile(currentUser.id),
          charityService.getCharities(true),
        ])

        setProfile(profileData)
        setCharities(charitiesData)
        setCharityPercent(profileData?.charity_percent || 10)

        // Load selected charity with fallback
        if (profileData?.charity_id) {
          console.log('Charity page: Loading charity for ID:', profileData.charity_id)
          const charityData = await charityService.getCharity(profileData.charity_id)
          if (charityData) {
            setSelectedCharity(charityData)
          } else {
            console.log('Charity not found, using fallback')
            // Fallback to first available charity
            if (charitiesData.length > 0) {
              setSelectedCharity(charitiesData[0])
            }
          }
        }
      } catch (error) {
        console.error('Error loading charity data:', error)
        setError('Failed to load charity information')
      } finally {
        setLoading(false)
      }
    }

    loadCharityData()
  }, [router])

  const handleUpdateCharity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedCharity) return

    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const updatedProfile = await profileService.updateProfile(user.id, {
        charity_id: selectedCharity.id,
        charity_percent: charityPercent,
      })

      if (updatedProfile) {
        setProfile(updatedProfile)
        setSuccess('Charity preferences updated successfully!')
        setShowEditModal(false)
      } else {
        setError('Failed to update charity preferences')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update charity preferences')
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = () => {
    setError(null)
    setSuccess(null)
    setShowEditModal(true)
  }

  const calculateMonthlyContribution = () => {
    if (!profile) return 0
    // Assuming monthly subscription for calculation
    const monthlyAmount = 9.99
    return (monthlyAmount * charityPercent) / 100
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
          <h1 className="text-3xl font-bold text-white">Charity Support</h1>
          <p className="text-gray-400">
            Manage your charitable giving preferences
          </p>
        </div>
        <Button onClick={openEditModal} className="flex items-center gap-2">
          <Edit2 size={16} />
          Edit Preferences
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Charity */}
        <Card className="bg-[#112240] border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart size={20} />
              Your Selected Charity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCharity ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#00ff87]/20 rounded-lg flex items-center justify-center">
                    <Heart className="text-[#00ff87]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-2">
                      {selectedCharity.name}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {selectedCharity.description}
                    </p>
                    {selectedCharity.is_featured && (
                      <span className="inline-block mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-medium rounded-full">
                        Featured Charity
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Your Contribution</p>
                    <p className="text-[#00ff87] font-bold text-lg">
                      {profile?.charity_percent || 10}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Monthly Amount</p>
                    <p className="text-white font-bold text-lg">
                      ${calculateMonthlyContribution().toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-pink-500/20 border border-pink-500/30 rounded-lg">
                  <p className="text-pink-400 text-sm">
                    Your monthly contribution helps {selectedCharity.name} continue their amazing work!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="text-gray-500 mx-auto mb-4" size={48} />
                <p className="text-gray-400 mb-4">No charity selected</p>
                <Button onClick={openEditModal}>Select a Charity</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Impact Stats */}
        <Card className="bg-[#112240] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp size={20} />
              Your Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Contributed</p>
              <p className="text-[#00ff87] font-bold text-2xl">
                $0.00
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Since joining
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Lives Impacted</p>
              <p className="text-white font-bold text-xl">
                0
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Estimated impact
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm mb-2">
                Want to make a bigger impact?
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Increase Contribution
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Charities */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Charities</CardTitle>
          <CardDescription className="text-gray-400">
            Browse and learn about all supported charities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity) => (
              <div
                key={charity.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedCharity?.id === charity.id
                    ? 'bg-[#00ff87]/10 border-[#00ff87]/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => setSelectedCharity(charity)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#00ff87]/20 rounded-lg flex items-center justify-center">
                    <Heart className="text-[#00ff87]" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">
                      {charity.name}
                    </h3>
                    {charity.is_featured && (
                      <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {charity.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Charity Preferences"
        size="md"
      >
        <form onSubmit={handleUpdateCharity} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Charity
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {charities.length === 0 ? (
                <p className="text-gray-400 text-sm p-3 bg-white/5 rounded-lg">
                  No charities available. Please contact an administrator.
                </p>
              ) : (
                charities.map((charity) => (
                  <div
                    key={charity.id}
                    onClick={() => setSelectedCharity(charity)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedCharity?.id === charity.id
                        ? 'bg-[#00ff87]/10 border-[#00ff87]/50'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="w-9 h-9 bg-[#00ff87]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="text-[#00ff87]" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {charity.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {charity.description}
                      </p>
                    </div>
                    {selectedCharity?.id === charity.id && (
                      <div className="w-4 h-4 rounded-full bg-[#00ff87] flex-shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label htmlFor="percent" className="block text-sm font-medium text-gray-300 mb-2">
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
              disabled={submitting}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>${calculateMonthlyContribution().toFixed(2)}/month</span>
              <span>100%</span>
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Minimum 10% of your subscription goes to charity
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={submitting}
              disabled={submitting || !selectedCharity}
              className="flex-1"
            >
              {submitting ? 'Updating...' : 'Update Preferences'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
