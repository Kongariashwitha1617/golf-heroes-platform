'use client'

import { useState, useEffect } from 'react'
import { scoreService, profileService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Target, Users, TrendingUp, Calendar, Trophy } from 'lucide-react'
import type { Score, Profile } from '@/types/database'

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadScores = async () => {
      try {
        const profilesData = await profileService.getAllProfiles()
        setProfiles(profilesData)
        
        const allScores = await Promise.all(
          profilesData.map(async (profile) => {
            const userScores = await scoreService.getScores(profile.id)
            return userScores
          })
        )
        setScores(allScores.flat())
      } catch (err) {
        console.error('Error loading scores:', err)
        setError('Failed to load scores')
      } finally {
        setLoading(false)
      }
    }
    loadScores()
  }, [])

  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId)
    return profile?.full_name || profile?.email || 'Unknown User'
  }

  const getUserEmail = (userId: string) => {
    const profile = profiles.find(p => p.id === userId)
    return profile?.email || ''
  }

  const totalScores = scores.length
  const averageScore = scores.length > 0 
    ? (scores.reduce((sum, score) => sum + score.score_value, 0) / scores.length).toFixed(1)
    : '0'
  const bestScore = scores.length > 0 
    ? Math.max(...scores.map(s => s.score_value))
    : 0

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
        <h1 className="text-3xl font-bold text-white">Scores</h1>
        <p className="text-gray-400">Manage golf scores and performance data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Scores</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {totalScores}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {averageScore}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Best Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {bestScore}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Players</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {profiles.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Scores ({scores.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Golf scores and performance data from all players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 font-medium text-gray-300">Player</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Score</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Course</th>
                  <th className="px-4 py-3 font-medium text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No scores found
                    </td>
                  </tr>
                ) : (
                  scores
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((score) => (
                    <tr key={score.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white">{getUserName(score.user_id)}</div>
                          <div className="text-xs text-gray-400">{getUserEmail(score.user_id)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          score.score_value <= 70
                            ? 'bg-green-500/20 text-green-400'
                            : score.score_value <= 80
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {score.score_value}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(score.score_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {'---'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium bg-gray-500/20 text-gray-400`}>
                          {'Pending'}
                        </span>
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
