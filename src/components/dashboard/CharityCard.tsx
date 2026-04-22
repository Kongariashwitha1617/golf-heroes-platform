'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { charityService } from '@/lib/supabase'
import type { Charity } from '@/types/database'
import { Heart, Info } from 'lucide-react'

interface CharityCardProps {
  charity?: Charity | null
  onSelect?: (charity: Charity) => void
  isSelectable?: boolean
}

export function CharityCard({ charity, onSelect, isSelectable = false }: CharityCardProps) {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(charity || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCharities = async () => {
      try {
        setLoading(true)
        const data = await charityService.getCharities()
        setCharities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load charities')
      } finally {
        setLoading(false)
      }
    }

    if (isSelectable) {
      loadCharities()
    }
  }, [isSelectable])

  const handleSelect = (selected: Charity) => {
    setSelectedCharity(selected)
    onSelect?.(selected)
  }

  if (!isSelectable && !selectedCharity) {
    return (
      <Card className="bg-[#112240] border-[#1e2d3d]">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Heart className="text-red-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">No Charity Selected</h3>
          </div>
          <p className="text-gray-300 text-sm">
            Select a charity to support with your winnings. Your chosen percentage will be donated automatically.
          </p>
        </div>
      </Card>
    )
  }

  if (isSelectable) {
    return (
      <Card className="bg-[#112240] border-[#1e2d3d]">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Choose a Charity</h3>
          {loading && <div className="text-gray-400">Loading charities...</div>}
          {error && <div className="text-red-400">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {charities.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelect(c)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedCharity?.id === c.id
                    ? 'border-[#00ff87] bg-[#00ff87]/10'
                    : 'border-[#1e2d3d] hover:border-[#00ff87]/50'
                }`}
              >
                <h4 className="font-semibold text-white mb-1">{c.name}</h4>
                <p className="text-sm text-gray-300">{c.description}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-[#112240] border-[#1e2d3d]">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Heart className="text-red-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{selectedCharity?.name}</h3>
            <p className="text-sm text-gray-300">{selectedCharity?.description}</p>
          </div>
        </div>
        <div className="bg-[#0a1628] rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-2">Your selected charity for donations</p>
          <p className="text-sm text-gray-200">
            A percentage of your winnings will be donated to {selectedCharity?.name}
          </p>
        </div>
      </div>
    </Card>
  )
}
