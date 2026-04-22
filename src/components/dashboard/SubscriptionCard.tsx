'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Subscription } from '@/types/database'
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'

interface SubscriptionCardProps {
  subscription?: Subscription | null
  renewalInfo?: {
    daysUntilRenewal: number
    renewalDate: string
  } | null
}

export function SubscriptionCard({ subscription, renewalInfo }: SubscriptionCardProps) {
  if (!subscription) {
    return (
      <Card className="bg-[#112240] border-[#1e2d3d]">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CreditCard className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">No Active Subscription</h3>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Subscribe to Golf Heroes to participate in draws and win prizes!
          </p>
          <button className="px-4 py-2 bg-[#00ff87] hover:bg-[#00dd75] text-[#0a1628] rounded-lg font-medium text-sm transition-colors">
            Upgrade Now
          </button>
        </div>
      </Card>
    )
  }

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    inactive: 'bg-gray-500/20 text-gray-400',
    cancelled: 'bg-red-500/20 text-red-400',
    lapsed: 'bg-yellow-500/20 text-yellow-400',
  }

  const planLabels = {
    monthly: 'Monthly Plan',
    yearly: 'Yearly Plan',
  }

  return (
    <Card className="bg-[#112240] border-[#1e2d3d]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CreditCard className="text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{planLabels[subscription.plan]}</h3>
              <Badge className={statusColors[subscription.status]}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-[#0a1628] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status</span>
            <span className="flex items-center gap-2 text-white font-medium">
              {subscription.status === 'active' && (
                <>
                  <CheckCircle2 size={16} className="text-green-400" />
                  Active
                </>
              )}
              {subscription.status !== 'active' && (
                <>
                  <AlertCircle size={16} className="text-yellow-400" />
                  {subscription.status}
                </>
              )}
            </span>
          </div>

          {renewalInfo && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Next Renewal</span>
                <span className="text-white font-medium">
                  {new Date(renewalInfo.renewalDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Days Until Renewal</span>
                <span className="text-[#00ff87] font-medium">{renewalInfo.daysUntilRenewal} days</span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#1e2d3d]">
            <span className="text-sm text-gray-400">Stripe ID</span>
            <span className="text-xs text-gray-500 font-mono">
              {subscription.stripe_subscription_id.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
