'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { isValidScore, isScoreDateValid } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

interface ScoreEntryProps {
  onAddScore: (score: number, date: string) => Promise<boolean>
  isLoading?: boolean
}

export function ScoreEntry({ onAddScore, isLoading = false }: ScoreEntryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [score, setScore] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const scoreValue = parseInt(score)
    if (!isValidScore(scoreValue)) {
      setError('Score must be between 1 and 45')
      return
    }

    if (!isScoreDateValid(date)) {
      setError('Score date cannot be in the future')
      return
    }

    setSubmitting(true)
    const success = await onAddScore(scoreValue, date)
    setSubmitting(false)

    if (success) {
      setScore('')
      setDate(new Date().toISOString().split('T')[0])
      setIsOpen(false)
    }
  }

  return (
    <>
      <Card className="bg-[#112240] border-[#1e2d3d]">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Add Score</h3>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-[#00ff87] hover:bg-[#00dd75] text-[#0a1628] gap-2"
            >
              <Plus size={16} /> Add Score
            </Button>
          </div>
          <p className="text-gray-300 text-sm">
            Record your daily golf scores in Stableford format (1-45 points)
          </p>
        </div>
      </Card>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Score">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Score (Stableford Points: 1-45)
            </label>
            <input
              type="number"
              min="1"
              max="45"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e2d3d] rounded-lg text-white focus:outline-none focus:border-[#00ff87]"
              placeholder="Enter score"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Score Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#0a1628] border border-[#1e2d3d] rounded-lg text-white focus:outline-none focus:border-[#00ff87]"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || isLoading}
              className="bg-[#00ff87] hover:bg-[#00dd75] text-[#0a1628] disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Score'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
