'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { scoreService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, isValidScore, isValidDate, isScoreDateValid } from '@/lib/utils'
import { Target, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import type { Score } from '@/types/database'

export default function ScoresPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [scoreValue, setScoreValue] = useState('')
  const [scoreDate, setScoreDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadScores = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)
        const userScores = await scoreService.getScores(currentUser.id)
        setScores(userScores)
      } catch (error) {
        console.error('Error loading scores:', error)
        setError('Failed to load scores')
      } finally {
        setLoading(false)
      }
    }

    loadScores()
  }, [router])

  const resetForm = () => {
    setScoreValue('')
    setScoreDate('')
    setError(null)
    setSuccess(null)
  }

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !scoreValue || !scoreDate) return

    // Validate score
    const score = parseInt(scoreValue)
    if (!isValidScore(score)) {
      setError('Score must be between 1 and 45 points')
      return
    }

    // Validate date
    if (!isValidDate(scoreDate)) {
      setError('Please enter a valid date (YYYY-MM-DD)')
      return
    }

    if (!isScoreDateValid(scoreDate)) {
      setError('Score date cannot be in the future')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const newScore = await scoreService.addScore({
        user_id: user.id,
        score_value: score,
        score_date: scoreDate
      })
      if (newScore) {
        setScores([newScore, ...scores])
        resetForm()
        setShowAddModal(false)
        setSuccess('Score added successfully!')
      } else {
        setError('Failed to add score')
      }
    } catch (error) {
      console.error('Error adding score:', error)
      setError('Failed to add score')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingScore || !scoreValue || !scoreDate) return

    // Validate score
    const score = parseInt(scoreValue)
    if (!isValidScore(score)) {
      setError('Score must be between 1 and 45 points')
      return
    }

    // Validate date
    if (!isValidDate(scoreDate)) {
      setError('Please enter a valid date (YYYY-MM-DD)')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const updatedScore = await scoreService.updateScore(editingScore.id, {
        score_value: score,
        score_date: scoreDate
      })
      if (updatedScore) {
        setScores(scores.map(s => s.id === updatedScore.id ? updatedScore : s))
        resetForm()
        setShowEditModal(false)
        setEditingScore(null)
        setSuccess('Score updated successfully!')
      } else {
        setError('Failed to update score')
      }
    } catch (error) {
      console.error('Error updating score:', error)
      setError('Failed to update score')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('Are you sure you want to delete this score?')) return

    try {
      const success = await scoreService.deleteScore(scoreId)
      if (success) {
        setScores(scores.filter(s => s.id !== scoreId))
        setSuccess('Score deleted successfully!')
      } else {
        setError('Failed to delete score')
      }
    } catch (error) {
      console.error('Error deleting score:', error)
      setError('Failed to delete score')
    }
  }

  const openEditModal = (score: Score) => {
    setEditingScore(score)
    setScoreValue(score.score_value.toString())
    setScoreDate(score.score_date)
    setShowEditModal(true)
    setError(null)
    setSuccess(null)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Score Management</h1>
          <p className="text-gray-400">Add and manage your golf scores</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Score
        </Button>
      </div>

      {/* Messages */}
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

      {/* Scores List */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target size={20} />
            Your Scores
          </CardTitle>
          <CardDescription className="text-gray-400">
            {scores.length}/5 scores recorded (maximum 5 per month)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scores.length > 0 ? (
            <div className="space-y-3">
              {scores.map((score) => (
                <div key={score.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#00ff87]/20 rounded-lg flex items-center justify-center">
                      <Target className="text-[#00ff87]" size={20} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{score.score_value} points</p>
                      <p className="text-gray-400 text-sm">{formatDate(score.score_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(score)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 size={14} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteScore(score.id)}
                      className="flex items-center gap-1 text-red-400 border-red-400/30 hover:bg-red-500/20"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="text-gray-500 mx-auto mb-4" size={48} />
              <p className="text-gray-400 mb-4">No scores recorded yet</p>
              <p className="text-gray-500 text-sm mb-6">
                Add your first golf score to start tracking your performance
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                Add Your First Score
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Score Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-[#112240] border-white/10 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Add New Score</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your Stableford score (1-45 points)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddScore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Score (Points)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                    placeholder="Enter score (1-45)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scoreDate}
                    onChange={(e) => setScoreDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={submitting}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Adding...' : 'Add Score'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Score Modal */}
      {showEditModal && editingScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-[#112240] border-white/10 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Edit Score</CardTitle>
              <CardDescription className="text-gray-400">
                Update your Stableford score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditScore} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Score (Points)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={scoreValue}
                    onChange={(e) => setScoreValue(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                    placeholder="Enter score (1-45)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scoreDate}
                    onChange={(e) => setScoreDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ff87] focus:border-transparent"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingScore(null)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={submitting}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'Updating...' : 'Update Score'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
