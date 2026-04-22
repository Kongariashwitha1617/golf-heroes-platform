'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Score } from '@/types/database'
import { Trash2, Edit2 } from 'lucide-react'

interface ScoreListProps {
  scores: Score[]
  onDelete?: (scoreId: string) => Promise<boolean>
  onEdit?: (score: Score) => void
  loading?: boolean
}

export function ScoreList({ scores, onDelete, onEdit, loading = false }: ScoreListProps) {
  const handleDelete = async (scoreId: string) => {
    if (window.confirm('Delete this score?')) {
      await onDelete?.(scoreId)
    }
  }

  if (scores.length === 0) {
    return (
      <Card className="bg-[#112240] border-[#1e2d3d]">
        <div className="p-6 text-center">
          <p className="text-gray-400">No scores recorded yet. Add your first score to get started!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-[#112240] border-[#1e2d3d]">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Scores</h3>
        <div className="space-y-3">
          {scores.map((score) => (
            <div
              key={score.id}
              className="flex items-center justify-between p-4 bg-[#0a1628] rounded-lg border border-[#1e2d3d] hover:border-[#00ff87]/30 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[#00ff87]/20">
                    <span className="text-lg font-bold text-[#00ff87]">{score.score_value}</span>
                    <span className="text-xs text-gray-400">pts</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {new Date(score.score_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      Recorded on {new Date(score.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(score)}
                  className="text-gray-400 hover:text-[#00ff87] p-2"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(score.id)}
                  disabled={loading}
                  className="text-gray-400 hover:text-red-400 p-2 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
