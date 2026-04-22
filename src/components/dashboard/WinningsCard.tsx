'use client'

import { Card } from '@/components/ui/Card'
import { Coins, TrendingUp } from 'lucide-react'

interface WinningsCardProps {
  totalWinnings?: number
  monthlyWinnings?: number
  nextDrawDate?: string
}

export function WinningsCard({
  totalWinnings = 0,
  monthlyWinnings = 0,
  nextDrawDate,
}: WinningsCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card className="bg-[#112240] border-[#1e2d3d]">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Coins className="text-yellow-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-white">Winnings</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0a1628] rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Winnings</p>
            <p className="text-2xl font-bold text-[#00ff87]">{formatCurrency(totalWinnings)}</p>
          </div>
          <div className="bg-[#0a1628] rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">This Month</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(monthlyWinnings)}</p>
          </div>
        </div>

        {nextDrawDate && (
          <div className="bg-[#1a2d3d] rounded-lg p-4 flex items-center gap-3">
            <TrendingUp className="text-[#00ff87]" size={20} />
            <div>
              <p className="text-xs text-gray-400">Next Draw</p>
              <p className="text-white font-medium">
                {new Date(nextDrawDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
