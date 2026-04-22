import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Score, DrawStats } from '@/types/database'

// ============================================
// STYLING & CSS UTILITIES
// ============================================

/** Combination of clsx and tailwindMerge for conditional Tailwind classes */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/** Format currency for display (USD) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Format date string to readable format */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/** Format date and time */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Get month name from month number (1-12) */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1] || 'Invalid'
}

/** Format a score value (1-45 in Stableford format) */
export function formatScore(score: number): string {
  return score.toString().padStart(2, '0')
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/** Validate golf score (must be 1-45 for Stableford) */
export function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 45
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/** Validate charity percentage (10-100) */
export function isValidCharityPercentage(percent: number): boolean {
  return Number.isInteger(percent) && percent >= 10 && percent <= 100
}

/** Validate date format (YYYY-MM-DD) */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/** Check if score date is not in the future */
export function isScoreDateValid(scoreDate: string): boolean {
  const date = new Date(scoreDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date <= today
}

// ============================================
// DRAW LOGIC UTILITIES
// ============================================

/** Generate 5 random numbers between 1-45 (lottery-style draw) */
export function generateRandomDraw(): number[] {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }
  return numbers.sort((a, b) => a - b)
}

/** Count how many user scores match the draw numbers */
export function checkMatch(userScores: number[], drawNumbers: number[]): number {
  if (!Array.isArray(userScores) || !Array.isArray(drawNumbers)) {
    return 0
  }
  return userScores.filter(score => drawNumbers.includes(score)).length
}

/** Determine prize tier (3, 4, or 5 matches) */
export function getPrizeTier(matchCount: number): 3 | 4 | 5 | null {
  if (matchCount >= 5) return 5
  if (matchCount === 4) return 4
  if (matchCount === 3) return 3
  return null
}

/** Get the 5 most recent scores from a user (for draw entry) */
export function getUserDrawNumbers(scores: Score[]): number[] {
  if (!Array.isArray(scores) || scores.length === 0) {
    return []
  }
  
  const sortedScores = [...scores].sort(
    (a, b) => new Date(b.score_date).getTime() - new Date(a.score_date).getTime()
  )
  
  return sortedScores.slice(0, 5).map(s => s.score_value)
}

/** Generate matched numbers array */
export function getMatchedNumbers(userScores: number[], drawNumbers: number[]): number[] {
  if (!Array.isArray(userScores) || !Array.isArray(drawNumbers)) {
    return []
  }
  return userScores.filter(score => drawNumbers.includes(score))
}

// ============================================
// PRIZE POOL CALCULATION UTILITIES
// ============================================

/** Calculate prize pool distribution: 5-Match: 40%, 4-Match: 35%, 3-Match: 25% */
export function calculatePrizeTiers(totalPool: number, jackpotRollover: number = 0) {
  const jackpot = totalPool * 0.4 + jackpotRollover
  const tier4 = totalPool * 0.35
  const tier3 = totalPool * 0.25
  return { jackpot, tier4, tier3 }
}

/** Calculate per-winner amount for a tier (splits equally among winners) */
export function calculatePerWinnerAmount(
  tierAmount: number,
  winnerCount: number
): number {
  if (winnerCount === 0) return 0
  return tierAmount / winnerCount
}

/** Calculate charity contribution amount */
export function calculateCharity(subscriptionAmount: number, percent: number): number {
  return (subscriptionAmount * percent) / 100
}

// ============================================
// SUBSCRIPTION UTILITIES
// ============================================

/** Check if subscription is in an active state */
export function isSubscriptionActive(status: string): boolean {
  return status === 'active'
}

/** Get subscription renewal information */
export function getSubscriptionInfo(renewalDate: string): {
  daysUntilRenewal: number
  renewalFormatted: string
  isRenewingSoon: boolean
} {
  const renewal = new Date(renewalDate)
  const now = new Date()
  const daysUntilRenewal = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return {
    daysUntilRenewal,
    renewalFormatted: formatDate(renewalDate),
    isRenewingSoon: daysUntilRenewal <= 7 && daysUntilRenewal >= 0,
  }
}

/** Get plan display name and pricing */
export function getPlanInfo(plan: string): { name: string; price: number; cycle: string } {
  const plans = {
    monthly: { name: 'Monthly', price: 9.99, cycle: 'month' },
    yearly: { name: 'Yearly', price: 99.99, cycle: 'year' },
  }
  return plans[plan as keyof typeof plans] || plans.monthly
}

// ============================================
// STATISTICS & ANALYTICS UTILITIES
// ============================================

/** Calculate draw statistics */
export function calculateDrawStats(
  matchCounts: number[],
  tier3Winners: number,
  tier4Winners: number,
  tier5Winners: number,
  tier3Amount: number,
  tier4Amount: number,
  tier5Amount: number
): DrawStats {
  return {
    total_participants: matchCounts.length,
    total_pool: tier3Amount + tier4Amount + tier5Amount,
    tier_3_winners: tier3Winners,
    tier_4_winners: tier4Winners,
    tier_5_winners: tier5Winners,
    tier_3_per_winner: tier3Winners > 0 ? tier3Amount / tier3Winners : 0,
    tier_4_per_winner: tier4Winners > 0 ? tier4Amount / tier4Winners : 0,
    tier_5_per_winner: tier5Winners > 0 ? tier5Amount / tier5Winners : 0,
  }
}

// ============================================
// DATE UTILITIES
// ============================================

/** Get current month and year */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

/** Get next month and year */
export function getNextMonthYear(): { month: number; year: number } {
  const now = new Date()
  now.setMonth(now.getMonth() + 1)
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

/** Check if a month/year is in the past */
export function isMonthInPast(month: number, year: number): boolean {
  const current = getCurrentMonthYear()
  if (year < current.year) return true
  if (year === current.year && month < current.month) return true
  return false
}

/** Get days until next draw (end of month) */
export function getDaysUntilNextDraw(): number {
  const now = new Date()
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysRemaining = Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(daysRemaining, 0)
}

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/** Safe JSON parse with fallback */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/** Create API error response */
export function createErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, any>
) {
  return {
    success: false,
    error: code,
    message,
    details,
    status,
  }
}

/** Create API success response */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  }
}

// ============================================
// STRING & TEXT UTILITIES
// ============================================

/** Truncate long text with ellipsis */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/** Capitalize first letter of string */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** Convert string to slug format */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================
// ARRAY UTILITIES
// ============================================

/** Remove duplicates from array */
export function removeDuplicates<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/** Group array items by a key */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = String(item[key])
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item)
    return groups
  }, {} as Record<string, T[]>)
}