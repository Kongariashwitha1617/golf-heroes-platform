'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { drawService, prizeService, scoreService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatDate, formatScore, getUserDrawNumbers } from '@/lib/utils'
import { Trophy, Calendar, Target, TrendingUp, AlertCircle, Heart } from 'lucide-react'
import type { Draw, Prize, Score } from '@/types/database'

export default function DrawsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [draws, setDraws] = useState<Draw[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDrawData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }

        setUser(currentUser)

        // Load user's scores and prizes in parallel
        const [scoresData, prizesData] = await Promise.all([
          scoreService.getScores(currentUser.id),
          prizeService.getUserPrizes(currentUser.id),
        ])

        setScores(scoresData)
        setPrizes(prizesData)

        // Load draws (mock data for now)
        const mockDraws: Draw[] = [
          {
            id: '1',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            status: 'published',
            draw_numbers: [5, 12, 18, 23, 31],
            jackpot_rollover: 0,
            total_pool: 10000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getMonth() + 1,
            year: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getFullYear(),
            status: 'published',
            draw_numbers: [3, 8, 15, 22, 29],
            jackpot_rollover: 0,
            total_pool: 8500,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
        setDraws(mockDraws)
      } catch (error) {
        console.error('Error loading draw data:', error)
        setError('Failed to load draw information')
      } finally {
        setLoading(false)
      }
    }

    loadDrawData()
  }, [router])

  const getUserDrawNumbersForDraw = (draw: Draw) => {
    if (scores.length === 0) return []
    return getUserDrawNumbers(scores)
  }

  const calculateWinnings = (draw: Draw, userNumbers: number[]) => {
    const matches = userNumbers.filter((num: number) => draw.draw_numbers.includes(num)).length
    if (matches === 0) return 0
    
    // Prize calculation based on matches
    const estimatedParticipants = 150 // Mock estimate
    const prizePerMatch = draw.total_pool / (estimatedParticipants * 3) // Average 3 matches per participant
    return matches * prizePerMatch
  }

  const totalWinnings = prizes.reduce((sum, prize) => sum + prize.amount, 0)
  const pendingWinnings = prizes
    .filter(prize => prize.status === 'pending')
    .reduce((sum, prize) => sum + prize.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" variant="white" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Draw Results</h1>
        <p className="text-gray-400">View monthly draw results and prizes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#112240] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Winnings</p>
                <p className="text-2xl font-bold text-[#00ff87]">
                  ${totalWinnings.toFixed(2)}
                </p>
              </div>
              <Trophy className="text-[#00ff87]" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-400">
                  ${pendingWinnings.toFixed(2)}
                </p>
              </div>
              <Calendar className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#112240] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Scores</p>
                <p className="text-2xl font-bold text-white">
                  {scores.length}/5
                </p>
              </div>
              <Target className="text-white" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Prizes */}
      {prizes.length > 0 && (
        <Card className="bg-[#112240] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy size={20} />
              Recent Prizes
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your latest winnings and payout status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prizes.map((prize) => (
                <div key={prize.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      prize.tier === 5 ? 'bg-yellow-400' :
                      prize.tier === 4 ? 'bg-blue-400' :
                      'bg-green-400'
                    }`} />
                    <div>
                      <span className="text-white font-semibold">
                        {prize.tier}-Number Match
                      </span>
                      <span className="text-gray-400 ml-2 text-sm">
                        Tier {prize.tier}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00ff87] font-semibold">
                      ${prize.amount.toFixed(2)}
                    </p>
                    <p className={`text-sm ${
                      prize.status === 'paid' ? 'text-green-400' :
                      prize.status === 'pending' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {prize.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draw History */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar size={20} />
            Draw History
          </CardTitle>
          <CardDescription className="text-gray-400">
            Monthly draws and your participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draws.length > 0 ? (
            <div className="space-y-6">
              {draws.map((draw) => {
                const userNumbers = getUserDrawNumbersForDraw(draw)
                const matches = userNumbers.filter((num: number) => draw.draw_numbers.includes(num)).length
                const winnings = calculateWinnings(draw, userNumbers)

                return (
                  <div key={draw.id} className="p-6 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {draw.month}/{draw.year}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          ${draw.total_pool.toLocaleString()} prize pool
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        draw.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {draw.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Winning Numbers */}
                      <div>
                        <h4 className="text-white font-medium mb-3">Winning Numbers</h4>
                        <div className="flex gap-2">
                          {draw.draw_numbers.map((num: number, index: number) => (
                            <div
                              key={index}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                                userNumbers.includes(num)
                                  ? 'bg-[#00ff87] text-black'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Your Numbers */}
                      <div>
                        <h4 className="text-white font-medium mb-3">Your Numbers</h4>
                        {userNumbers.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              {userNumbers.map((num: number, index: number) => (
                                <div
                                  key={index}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                                    draw.draw_numbers.includes(num)
                                      ? 'bg-[#00ff87] text-black'
                                      : 'bg-white/10 text-white'
                                  }`}
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-400">Matches: </span>
                              <span className="text-white font-medium">{matches}/5</span>
                            </div>
                            {winnings > 0 && (
                              <div className="text-sm">
                                <span className="text-gray-400">Winnings: </span>
                                <span className="text-[#00ff87] font-medium">${winnings.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            No scores recorded for this draw period
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="text-gray-500 mx-auto mb-4" size={48} />
              <p className="text-gray-400 mb-4">No draws available yet</p>
              <p className="text-gray-500 text-sm">
                Draws are generated monthly based on your scores
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp size={20} />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00ff87]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="text-[#00ff87]" size={20} />
              </div>
              <h3 className="text-white font-medium mb-2">1. Record Scores</h3>
              <p className="text-gray-400 text-sm">
                Enter up to 5 golf scores per month to participate in draws
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00ff87]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trophy className="text-[#00ff87]" size={20} />
              </div>
              <h3 className="text-white font-medium mb-2">2. Monthly Draw</h3>
              <p className="text-gray-400 text-sm">
                Your scores generate unique numbers for monthly prize draws
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#00ff87]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="text-[#00ff87]" size={20} />
              </div>
              <h3 className="text-white font-medium mb-2">3. Win Prizes</h3>
              <p className="text-gray-400 text-sm">
                Match numbers to win cash prizes while supporting charity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
