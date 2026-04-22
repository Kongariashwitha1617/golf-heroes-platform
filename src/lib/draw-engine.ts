import type { Score } from '@/types/database'
import { generateRandomDraw, checkMatch, getPrizeTier, getUserDrawNumbers } from './utils'

/**
 * Draw Engine Module
 * Handles all draw-related logic including number generation, matching, and statistics
 */

// ============================================
// DRAW GENERATION
// ============================================

/**
 * Generate a draw based on algorithm type
 * @param type 'random' for lottery-style, 'algorithmic' for weighted by frequency
 * @param userScores Optional: array of all user scores for algorithmic drawing
 */
export function generateDraw(
  type: 'random' | 'algorithmic' = 'random',
  userScores?: Score[]
): number[] {
  if (type === 'algorithmic' && userScores && userScores.length > 0) {
    return generateAlgorithmicDraw(userScores)
  }
  return generateRandomDraw()
}

/**
 * Generate draw based on frequency of scores (algorithmic method)
 * Weighted towards most frequently appearing numbers
 */
function generateAlgorithmicDraw(allScores: Score[]): number[] {
  if (allScores.length === 0) {
    return generateRandomDraw()
  }

  // Count frequency of each score
  const scoreFrequency: Record<number, number> = {}
  allScores.forEach(score => {
    scoreFrequency[score.score_value] = (scoreFrequency[score.score_value] || 0) + 1
  })

  // Create weighted selection pool (higher frequency = higher chance)
  const sortedScores = Object.entries(scoreFrequency)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .map(([score]) => parseInt(score))

  const selectedNumbers: number[] = []
  const availableScores = [...sortedScores]

  // Select 5 numbers weighted by frequency
  while (selectedNumbers.length < 5 && availableScores.length > 0) {
    // Use weighted random: higher frequency = higher probability
    let randomIndex = Math.floor(Math.random() * Math.min(availableScores.length, 3))
    selectedNumbers.push(availableScores[randomIndex])
    availableScores.splice(randomIndex, 1)
  }

  // If we don't have enough numbers, fill with random ones
  while (selectedNumbers.length < 5) {
    const randomNum = Math.floor(Math.random() * 45) + 1
    if (!selectedNumbers.includes(randomNum)) {
      selectedNumbers.push(randomNum)
    }
  }

  return selectedNumbers.sort((a, b) => a - b)
}

// ============================================
// DRAW MATCHING & SCORING
// ============================================

/**
 * Process all user entries for a draw
 * Returns array of matched entries with their tier
 */
export function processDrawMatches(
  drawNumbers: number[],
  userScoresList: Array<{ userId: string; scores: Score[] }>
): Array<{
  userId: string
  userNumbers: number[]
  matchedNumbers: number[]
  matchCount: number
  tier: 3 | 4 | 5 | null
}> {
  return userScoresList.map(({ userId, scores }) => {
    const userNumbers = getUserDrawNumbers(scores)
    const matchedNumbers = userNumbers.filter(num => drawNumbers.includes(num))
    const matchCount = matchedNumbers.length
    const tier = getPrizeTier(matchCount)

    return {
      userId,
      userNumbers,
      matchedNumbers,
      matchCount,
      tier,
    }
  })
}

/**
 * Get winners for a specific tier from processed matches
 */
export function getWinnersForTier(
  matches: ReturnType<typeof processDrawMatches>,
  tier: 3 | 4 | 5
): string[] {
  return matches
    .filter(m => m.tier === tier)
    .map(m => m.userId)
}

/**
 * Calculate winner statistics from processed matches
 */
export function calculateWinnerStats(
  matches: ReturnType<typeof processDrawMatches>
) {
  const tier3 = matches.filter(m => m.tier === 3).length
  const tier4 = matches.filter(m => m.tier === 4).length
  const tier5 = matches.filter(m => m.tier === 5).length

  return {
    tier3Winners: tier3,
    tier4Winners: tier4,
    tier5Winners: tier5,
    totalWinners: tier3 + tier4 + tier5,
    noWinners: matches.filter(m => m.tier === null).length,
  }
}

// ============================================
// PRIZE CALCULATION
// ============================================

/**
 * Calculate individual prize amounts
 */
export function calculatePrizeAmounts(
  totalPool: number,
  jackpotRollover: number,
  tier3Winners: number,
  tier4Winners: number,
  tier5Winners: number
): {
  tier3Amount: number
  tier4Amount: number
  tier5Amount: number
  tier3PerWinner: number
  tier4PerWinner: number
  tier5PerWinner: number
} {
  // Distribution: 5-Match: 40%, 4-Match: 35%, 3-Match: 25%
  const tier5Pool = totalPool * 0.4 + jackpotRollover
  const tier4Pool = totalPool * 0.35
  const tier3Pool = totalPool * 0.25

  return {
    tier3Amount: tier3Pool,
    tier4Amount: tier4Pool,
    tier5Amount: tier5Pool,
    tier3PerWinner: tier3Winners > 0 ? tier3Pool / tier3Winners : 0,
    tier4PerWinner: tier4Winners > 0 ? tier4Pool / tier4Winners : 0,
    tier5PerWinner: tier5Winners > 0 ? tier5Pool / tier5Winners : 0,
  }
}

// ============================================
// DRAW SIMULATION
// ============================================

/**
 * Simulate a draw with current data (dry-run before publishing)
 * Useful for previewing results before official publication
 */
export function simulateDraw(
  drawNumbers: number[],
  userScoresList: Array<{ userId: string; scores: Score[] }>,
  totalPool: number,
  jackpotRollover: number
) {
  const matches = processDrawMatches(drawNumbers, userScoresList)
  const stats = calculateWinnerStats(matches)
  const prizeAmounts = calculatePrizeAmounts(
    totalPool,
    jackpotRollover,
    stats.tier3Winners,
    stats.tier4Winners,
    stats.tier5Winners
  )

  return {
    drawNumbers,
    totalParticipants: userScoresList.length,
    matches,
    stats,
    prizes: prizeAmounts,
    summary: {
      totalWinners: stats.totalWinners,
      totalPool,
      tier5Jackpot: prizeAmounts.tier5PerWinner,
      tier4Amount: prizeAmounts.tier4PerWinner,
      tier3Amount: prizeAmounts.tier3PerWinner,
    },
  }
}

// ============================================
// JACKPOT ROLLOVER
// ============================================

/**
 * Determine if jackpot should rollover (no 5-match winners)
 */
export function shouldRolloverJackpot(tier5Winners: number): boolean {
  return tier5Winners === 0
}

/**
 * Calculate new jackpot amount for next draw
 */
export function calculateNewJackpot(
  currentJackpot: number,
  tier5Pool: number,
  tier5Winners: number
): number {
  if (tier5Winners === 0) {
    return currentJackpot + tier5Pool
  }
  return tier5Pool / tier5Winners
}

// ============================================
// DRAW VALIDATION
// ============================================

/**
 * Validate draw numbers format
 */
export function isValidDrawNumbers(numbers: number[]): boolean {
  // Must be exactly 5 numbers
  if (!Array.isArray(numbers) || numbers.length !== 5) {
    return false
  }

  // Must be in range 1-45
  if (!numbers.every(n => Number.isInteger(n) && n >= 1 && n <= 45)) {
    return false
  }

  // Must be unique
  if (new Set(numbers).size !== 5) {
    return false
  }

  return true
}

// ============================================
// DEBUG & TESTING UTILITIES
// ============================================

/**
 * Generate test draw scenario with realistic data
 */
export function generateTestDrawScenario(participantCount: number = 50) {
  // Generate random draw
  const drawNumbers = generateRandomDraw()

  // Generate realistic user scores
  const userScoresList = Array.from({ length: participantCount }, (_, idx) => ({
    userId: `user-${idx + 1}`,
    scores: Array.from({ length: 5 }, () => ({
      id: `score-${Math.random()}`,
      user_id: `user-${idx + 1}`,
      score_value: Math.floor(Math.random() * 45) + 1,
      score_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  }))

  return {
    drawNumbers,
    userScoresList,
    totalPool: participantCount * 6, // ~$6 per user average
    jackpotRollover: 0,
  }
}