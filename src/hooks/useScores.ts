'use client'

import { useState, useEffect, useCallback } from 'react'
import { scoreService } from '@/lib/supabase'
import { isValidScore, isScoreDateValid, getUserDrawNumbers } from '@/lib/utils'
import type { Score } from '@/types/database'

interface UseScoresReturn {
  scores: Score[]
  loading: boolean
  error: string | null
  addScore: (scoreValue: number, scoreDate: string) => Promise<boolean>
  updateScore: (scoreId: string, scoreValue: number) => Promise<boolean>
  deleteScore: (scoreId: string) => Promise<boolean>
  refetch: () => Promise<void>
  drawNumbers: number[]
}

export function useScores(userId: string | null): UseScoresReturn {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================
  // FETCH SCORES
  // ============================================

  const fetchScores = useCallback(async (uId: string) => {
    try {
      setLoading(true)
      setError(null)
      const userScores = await scoreService.getScores(uId)
      setScores(userScores)
    } catch (err) {
      console.error('Error fetching scores:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch scores')
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================
  // INITIALIZE ON MOUNT
  // ============================================

  useEffect(() => {
    if (userId) {
      fetchScores(userId)
    }
  }, [userId, fetchScores])

  // ============================================
  // ADD SCORE
  // ============================================

  const addScore = useCallback(
    async (scoreValue: number, scoreDate: string): Promise<boolean> => {
      if (!userId) {
        setError('User not authenticated')
        return false
      }

      // Validation
      if (!isValidScore(scoreValue)) {
        setError('Score must be between 1 and 45')
        return false
      }

      if (!isScoreDateValid(scoreDate)) {
        setError('Score date cannot be in the future')
        return false
      }

      // Check for duplicate
      const existing = scores.find((s) => s.score_date === scoreDate)
      if (existing) {
        setError(`Score already exists for ${scoreDate}`)
        return false
      }

      try {
        const newScore = await scoreService.addScore({
          user_id: userId,
          score_value: scoreValue,
          score_date: scoreDate,
        })

        if (newScore) {
          // Update local state
          const updated = [newScore, ...scores].slice(0, 5) // Keep only latest 5
          setScores(updated)
          setError(null)
          return true
        }
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add score'
        setError(message)
        return false
      }
    },
    [userId, scores]
  )

  // ============================================
  // UPDATE SCORE
  // ============================================

  const updateScore = useCallback(
    async (scoreId: string, scoreValue: number): Promise<boolean> => {
      // Validation
      if (!isValidScore(scoreValue)) {
        setError('Score must be between 1 and 45')
        return false
      }

      try {
        const updated = await scoreService.updateScore(scoreId, { score_value: scoreValue })

        if (updated) {
          // Update local state
          setScores(scores.map((s) => (s.id === scoreId ? updated : s)))
          setError(null)
          return true
        }
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update score'
        setError(message)
        return false
      }
    },
    [scores]
  )

  // ============================================
  // DELETE SCORE
  // ============================================

  const deleteScore = useCallback(
    async (scoreId: string): Promise<boolean> => {
      try {
        const success = await scoreService.deleteScore(scoreId)

        if (success) {
          setScores(scores.filter((s) => s.id !== scoreId))
          setError(null)
          return true
        }
        return false
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete score'
        setError(message)
        return false
      }
    },
    [scores]
  )

  // ============================================
  // REFETCH
  // ============================================

  const refetch = useCallback(async () => {
    if (userId) {
      await fetchScores(userId)
    }
  }, [userId, fetchScores])

  // ============================================
  // COMPUTE DRAW NUMBERS
  // ============================================

  const drawNumbers = getUserDrawNumbers(scores)

  return {
    scores,
    loading,
    error,
    addScore,
    updateScore,
    deleteScore,
    refetch,
    drawNumbers,
  }
}
