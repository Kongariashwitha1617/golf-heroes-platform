import type { Prize, PrizePool, Subscription } from '@/types/database'

/**
 * Prize Calculator Module
 * Handles all prize pool calculations and distributions
 */

// ============================================
// PRIZE POOL INITIALIZATION
// ============================================

/**
 * Calculate total prize pool from subscriptions
 * Assumes subscription contributions to pool
 */
export function calculatePrizePoolFromSubscriptions(
  subscriptions: Subscription[] | undefined
): number {
  if (!subscriptions || subscriptions.length === 0) {
    return 0
  }

  let totalPool = 0
  subscriptions.forEach((sub) => {
    if (sub.status === 'active') {
      // Allocate percentage based on plan
      // Monthly: $9.99 -> ~$6 to pool (60%)
      // Yearly: $99.99 -> ~$60 to pool (60%)
      const monthlyAmount = sub.plan === 'monthly' ? 9.99 : 99.99 / 12
      totalPool += monthlyAmount * 0.6 // 60% goes to prize pool
    }
  })

  return parseFloat(totalPool.toFixed(2))
}

/**
 * Initialize prize pool distribution
 */
export function initializePrizePool(
  totalPool: number,
  jackpotRollover: number = 0
): PrizePool {
  const tier5Amount = totalPool * 0.4 + jackpotRollover
  const tier4Amount = totalPool * 0.35
  const tier3Amount = totalPool * 0.25

  return {
    id: '', // Will be set by database
    draw_id: '', // Will be set by parent draw
    total_pool: parseFloat(totalPool.toFixed(2)),
    tier_5_amount: parseFloat(tier5Amount.toFixed(2)),
    tier_4_amount: parseFloat(tier4Amount.toFixed(2)),
    tier_3_amount: parseFloat(tier3Amount.toFixed(2)),
    created_at: new Date().toISOString(),
  }
}

// ============================================
// PRIZE DISTRIBUTION CALCULATION
// ============================================

/**
 * Calculate per-winner prize amounts
 */
export function calculatePerWinnerPrizes(
  prizePool: PrizePool,
  tier3Winners: number,
  tier4Winners: number,
  tier5Winners: number
): {
  tier3PerWinner: number
  tier4PerWinner: number
  tier5PerWinner: number
} {
  return {
    tier3PerWinner:
      tier3Winners > 0 ? parseFloat((prizePool.tier_3_amount / tier3Winners).toFixed(2)) : 0,
    tier4PerWinner:
      tier4Winners > 0 ? parseFloat((prizePool.tier_4_amount / tier4Winners).toFixed(2)) : 0,
    tier5PerWinner:
      tier5Winners > 0 ? parseFloat((prizePool.tier_5_amount / tier5Winners).toFixed(2)) : 0,
  }
}

/**
 * Create prize records for winners
 */
export function createPrizeRecords(
  drawId: string,
  winnersByTier: {
    tier3: Array<{ userId: string }>
    tier4: Array<{ userId: string }>
    tier5: Array<{ userId: string }>
  },
  prizeAmounts: {
    tier3PerWinner: number
    tier4PerWinner: number
    tier5PerWinner: number
  }
): Omit<Prize, 'id' | 'created_at' | 'updated_at'>[] {
  const prizes: Omit<Prize, 'id' | 'created_at' | 'updated_at'>[] = []

  // 3-Match winners
  winnersByTier.tier3.forEach((winner) => {
    prizes.push({
      draw_id: drawId,
      user_id: winner.userId,
      tier: 3,
      amount: prizeAmounts.tier3PerWinner,
      status: 'pending',
    })
  })

  // 4-Match winners
  winnersByTier.tier4.forEach((winner) => {
    prizes.push({
      draw_id: drawId,
      user_id: winner.userId,
      tier: 4,
      amount: prizeAmounts.tier4PerWinner,
      status: 'pending',
    })
  })

  // 5-Match winners
  winnersByTier.tier5.forEach((winner) => {
    prizes.push({
      draw_id: drawId,
      user_id: winner.userId,
      tier: 5,
      amount: prizeAmounts.tier5PerWinner,
      status: 'pending',
    })
  })

  return prizes
}

// ============================================
// JACKPOT ROLLOVER LOGIC
// ============================================

/**
 * Determine if tier 5 (jackpot) should rollover
 */
export function shouldRolloverJackpot(tier5Winners: number): boolean {
  return tier5Winners === 0
}

/**
 * Calculate new jackpot for next draw
 */
export function calculateNewJackpot(
  currentJackpot: number,
  tier5PoolAmount: number,
  tier5Winners: number
): number {
  if (tier5Winners === 0) {
    // No winners, entire jackpot rolls over
    return parseFloat((currentJackpot + tier5PoolAmount).toFixed(2))
  }
  // Winners exist, jackpot resets to next month's tier 5 pool
  return 0
}

// ============================================
// STATISTICS & REPORTING
// ============================================

/**
 * Calculate allocation statistics
 */
export function calculateAllocationStats(
  totalPool: number,
  jackpotRollover: number
): {
  tier5Percentage: number
  tier4Percentage: number
  tier3Percentage: number
  tier5Amount: number
  tier4Amount: number
  tier3Amount: number
  jackpotCarrover: number
} {
  const tier5Amount = totalPool * 0.4 + jackpotRollover
  const tier4Amount = totalPool * 0.35
  const tier3Amount = totalPool * 0.25

  return {
    tier5Percentage: 40,
    tier4Percentage: 35,
    tier3Percentage: 25,
    tier5Amount: parseFloat(tier5Amount.toFixed(2)),
    tier4Amount: parseFloat(tier4Amount.toFixed(2)),
    tier3Amount: parseFloat(tier3Amount.toFixed(2)),
    jackpotCarrover: parseFloat(jackpotRollover.toFixed(2)),
  }
}

/**
 * Calculate participant expected winnings
 */
export function calculateExpectedWinnings(
  matchProbabilities: {
    tier3: number // 3-match probability as percentage (0-100)
    tier4: number // 4-match probability
    tier5: number // 5-match probability
  },
  perWinnerAmounts: {
    tier3: number
    tier4: number
    tier5: number
  }
): number {
  const expectedValueTier3 = (matchProbabilities.tier3 / 100) * perWinnerAmounts.tier3
  const expectedValueTier4 = (matchProbabilities.tier4 / 100) * perWinnerAmounts.tier4
  const expectedValueTier5 = (matchProbabilities.tier5 / 100) * perWinnerAmounts.tier5

  return parseFloat(
    (expectedValueTier3 + expectedValueTier4 + expectedValueTier5).toFixed(2)
  )
}

// ============================================
// CHARITY CONTRIBUTION CALCULATION
// ============================================

/**
 * Calculate total charity contribution for a draw
 */
export function calculateTotalCharityContributed(
  subscriptions: Subscription[],
  charityPercentages: Array<{ userId: string; percent: number }>
): Map<string, number> {
  const charityMap = new Map<string, number>()

  subscriptions.forEach((sub) => {
    const userCharity = charityPercentages.find((c) => c.userId === sub.user_id)
    if (userCharity && sub.status === 'active') {
      const monthlyAmount = sub.plan === 'monthly' ? 9.99 : 99.99 / 12
      const charityAmount = (monthlyAmount * userCharity.percent) / 100

      const currentTotal = charityMap.get(sub.user_id) || 0
      charityMap.set(sub.user_id, currentTotal + charityAmount)
    }
  })

  return charityMap
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate prize tier
 */
export function isValidPrizeTier(tier: any): boolean {
  return tier === 3 || tier === 4 || tier === 5
}

/**
 * Validate prize amount
 */
export function isValidPrizeAmount(amount: any): boolean {
  if (typeof amount !== 'number') return false
  return amount >= 0 && amount <= 999999.99 // Reasonable upper limit
}

/**
 * Validate total winners math
 */
export function validatePrizeDistribution(
  totalPool: number,
  tier3Winners: number,
  tier4Winners: number,
  tier5Winners: number,
  tier3PerWinner: number,
  tier4PerWinner: number,
  tier5PerWinner: number,
  jackpotRollover: number = 0
): boolean {
  const expectedTier3Total = tier3Winners * tier3PerWinner
  const expectedTier4Total = tier4Winners * tier4PerWinner
  const expectedTier5Total = tier5Winners * tier5PerWinner

  const tier5Pool = totalPool * 0.4 + jackpotRollover
  const tier4Pool = totalPool * 0.35
  const tier3Pool = totalPool * 0.25

  // Allow for small rounding differences
  const tolerance = 0.01
  return (
    Math.abs(expectedTier3Total - tier3Pool) < tolerance &&
    Math.abs(expectedTier4Total - tier4Pool) < tolerance &&
    Math.abs(expectedTier5Total - tier5Pool) < tolerance
  )
}
