'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import type { DrawStatus } from '@/types/database'
import { Calendar, Users, Trophy } from 'lucide-react'

interface DrawHistoryItem {
  id: string
  name: string
  date: string
  status: DrawStatus
  participantCount?: number
  prizePool?: number
}

interface DrawHistoryProps {
  draws?: DrawHistoryItem[]
  loading?: boolean
  onDrawClick?: (drawId: string) => void
}

export function DrawHistory({ draws = [], loading = false, onDrawClick }: DrawHistoryProps) {
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    simulated: 'bg-blue-500/20 text-blue-400',
    published: 'bg-green-500/20 text-green-400',
  }

  if (loading) {
    return (
      <Card className="bg-[#112240] border-[#1e2d3d]">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Draw History</h3>
          <div className="text-gray-400">Loading draws...</div>
        </div>
      </Card>
    )
  }

  if (draws.length === 0) {
    return (
      <Card className="bg-[#112240] border-[#1e2d3d]">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Draw History</h3>
          <div className="text-center py-8">
            <Trophy className="text-gray-500 mx-auto mb-3" size={32} />
            <p className="text-gray-400">No draws available yet</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-[#112240] border-[#1e2d3d]">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Draw History</h3>
        <div className="space-y-3">
          {draws.map((draw) => (
            <button
              key={draw.id}
              onClick={() => onDrawClick?.(draw.id)}
              className="w-full p-4 bg-[#0a1628] rounded-lg border border-[#1e2d3d] hover:border-[#00ff87]/30 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{draw.name}</h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[draw.status]
                  }`}
                >
                  {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>
                    {new Date(draw.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {draw.participantCount && (
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{draw.participantCount} participants</span>
                  </div>
                )}
                {draw.prizePool && (
                  <div className="flex items-center gap-2">
                    <Trophy size={14} />
                    <span>${draw.prizePool.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
