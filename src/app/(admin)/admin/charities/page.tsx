'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { charityService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Heart, Plus, Edit, Trash2, Eye, Users, DollarSign, TrendingUp } from 'lucide-react'
import type { Charity } from '@/types/database'

export default function AdminCharities() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_featured: false,
    is_active: true
  })

  useEffect(() => {
    const loadCharities = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        setCurrentUser(user)
        const charitiesData = await charityService.getCharities()
        setCharities(charitiesData)
      } catch (error) {
        console.error('Error loading charities:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCharities()
  }, [])

  const handleCreateCharity = async () => {
    try {
      const newCharity = await charityService.createCharity(formData)
      if (newCharity) {
        setCharities([...charities, newCharity])
        setFormData({
          name: '',
          description: '',
          image_url: '',
          is_featured: false,
          is_active: true
        })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating charity:', error)
    }
  }

  const handleUpdateCharity = async (charityId: string, updates: Partial<Charity>) => {
    try {
      const updatedCharity = await charityService.updateCharity(charityId, updates)
      if (updatedCharity) {
        setCharities(charities.map(c => c.id === charityId ? updatedCharity : c))
        setSelectedCharity(updatedCharity)
      }
    } catch (error) {
      console.error('Error updating charity:', error)
    }
  }

  const handleDeleteCharity = async (charityId: string) => {
    if (!confirm('Are you sure you want to delete this charity?')) return

    try {
      const success = await charityService.deleteCharity(charityId)
      if (success) {
        setCharities(prev => prev.filter(c => c.id !== charityId))
        setSelectedCharity(null)
      } else {
        console.error('Delete failed - check RLS policies in Supabase')
        alert('Delete failed. Please check Supabase RLS policies.')
      }
    } catch (error) {
      console.error('Error deleting charity:', error)
      alert('Delete failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" variant="white" />
      </div>
    )
  }

  const activeCharities = charities.filter(c => c.is_active)
  const inactiveCharities = charities.filter(c => !c.is_active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Charity Management</h1>
          <p className="text-gray-400">
            Manage charity partners and donations
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#00ff87] text-[#0a1628] hover:bg-[#00ff87]/90"
        >
          <Plus size={20} className="mr-2" />
          Add Charity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Charities</CardTitle>
            <Heart className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-400">{charities.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{activeCharities.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Inactive</CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{inactiveCharities.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Charity Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#112240] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add New Charity</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                  placeholder="Charity name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                  placeholder="Charity description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-[#00ff87] bg-[#0a1628] border-white/20 rounded focus:ring-[#00ff87] focus:ring-2"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-300">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCharity}
                disabled={!formData.name}
              >
                Create Charity
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Charities List */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Charities ({charities.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage charity partners and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {charities.map((charity) => (
              <div key={charity.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00ff87]/20 rounded-full flex items-center justify-center">
                    <Heart className="text-[#00ff87]" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{charity.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{charity.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {charity.image_url && (
                        <a
                          href={charity.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                        >
                          <Eye size={14} />
                          Logo
                        </a>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        charity.is_active 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {charity.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCharity(charity)}
                    className="text-blue-400"
                  >
                    <Edit size={14} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCharity(charity.id)}
                    className="text-red-400"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charity Details Modal */}
      {selectedCharity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#112240] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Charity Details</h3>
              <button
                onClick={() => setSelectedCharity(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Name</p>
                <p className="text-white font-medium">{selectedCharity.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Description</p>
                <p className="text-white font-medium">{selectedCharity.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCharity.is_active 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedCharity.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Created</p>
                  <p className="text-white font-medium">
                    {new Date(selectedCharity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Logo</p>
                {selectedCharity.image_url && (
                <a
                  href={selectedCharity.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {selectedCharity.image_url}
                </a>
              )}
              </div>

              {selectedCharity.image_url && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Logo</p>
                  <img
                    src={selectedCharity.image_url}
                    alt={selectedCharity.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setSelectedCharity(null)}
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