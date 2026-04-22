'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Prize, Profile } from '@/types/database'

export default function WinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load winners
  useEffect(() => {
    const loadWinners = async () => {
      try {
        // Mock data for now
        const mockWinners = [
          {
            id: '1',
            draw_id: '1',
            user_id: '1',
            tier: 5,
            amount: 100,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]
        setWinners(mockWinners)
      } catch (err) {
        console.error('Error loading winners:', err)
        setError('Failed to load winners')
      } finally {
        setLoading(false)
      }
    }

    loadWinners()
  }, [])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please try again later.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Winners</h1>
        <Button onClick={() => console.log('Load Winners')}>
          Load Winners
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Winner Management</CardTitle>
          <CardDescription>Manage prize winners and payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {winners.length === 0 ? (
            <p className="text-gray-500">No winners found</p>
          ) : (
            <div className="space-y-4">
              {winners.map((winner) => (
                <div key={winner.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {winner.amount} - Tier {winner.tier}
                      </h3>
                      <p className="text-sm text-gray-600">
                        User: {winner.user?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Status: {winner.status}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}