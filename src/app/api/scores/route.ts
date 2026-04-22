import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scoreService } from '@/lib/supabase'
import { createSuccessResponse, createErrorResponse, isValidScore, isValidDate, isScoreDateValid } from '@/lib/utils'
import type { ScoreEntryRequest } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required'),
        { status: 400 }
      )
    }

    const scores = await scoreService.getScores(userId)
    
    return NextResponse.json(
      createSuccessResponse(scores),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/scores error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreEntryRequest & { userId: string } = await request.json()
    const { userId, score_value, score_date } = body

    // Validation
    if (!userId || score_value === undefined || !score_date) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_FIELDS', 'Required fields are missing'),
        { status: 400 }
      )
    }

    const score = parseInt(score_value.toString())
    if (!isValidScore(score)) {
      return NextResponse.json(
        createErrorResponse(400, 'INVALID_SCORE', 'Score must be between 1 and 45'),
        { status: 400 }
      )
    }

    if (!isValidDate(score_date)) {
      return NextResponse.json(
        createErrorResponse(400, 'INVALID_DATE', 'Invalid date format'),
        { status: 400 }
      )
    }

    if (!isScoreDateValid(score_date)) {
      return NextResponse.json(
        createErrorResponse(400, 'FUTURE_DATE', 'Score date cannot be in future'),
        { status: 400 }
      )
    }

    // Check for duplicate score on same date
    const existingScore = await scoreService.getScoreByDate(userId, score_date)
    if (existingScore) {
      return NextResponse.json(
        createErrorResponse(409, 'DUPLICATE_SCORE', 'Score already exists for this date'),
        { status: 409 }
      )
    }

    const newScore = await scoreService.addScore({
      user_id: userId,
      score_value: score,
      score_date: score_date,
    })

    if (!newScore) {
      return NextResponse.json(
        createErrorResponse(500, 'CREATE_FAILED', 'Failed to create score'),
        { status: 500 }
      )
    }

    return NextResponse.json(
      createSuccessResponse(newScore, 'Score added successfully'),
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/scores error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { scoreId, userId, score_value, score_date } = body

    // Validation
    if (!scoreId || !userId) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_FIELDS', 'Score ID and User ID are required'),
        { status: 400 }
      )
    }

    const score = parseInt(score_value?.toString() || '0')
    if (score_value !== undefined && !isValidScore(score)) {
      return NextResponse.json(
        createErrorResponse(400, 'INVALID_SCORE', 'Score must be between 1 and 45'),
        { status: 400 }
      )
    }

    if (score_date && !isValidDate(score_date)) {
      return NextResponse.json(
        createErrorResponse(400, 'INVALID_DATE', 'Invalid date format'),
        { status: 400 }
      )
    }

    if (score_date && !isScoreDateValid(score_date)) {
      return NextResponse.json(
        createErrorResponse(400, 'FUTURE_DATE', 'Score date cannot be in future'),
        { status: 400 }
      )
    }

    // Check for duplicate score on same date (excluding current score)
    if (score_date) {
      const existingScore = await scoreService.getScoreByDate(userId, score_date)
      if (existingScore && existingScore.id !== scoreId) {
        return NextResponse.json(
          createErrorResponse(409, 'DUPLICATE_SCORE', 'Score already exists for this date'),
          { status: 409 }
        )
      }
    }

    const updateData: any = {}
    if (score_value !== undefined) updateData.score_value = score
    if (score_date !== undefined) updateData.score_date = score_date

    const updatedScore = await scoreService.updateScore(scoreId, updateData)

    if (!updatedScore) {
      return NextResponse.json(
        createErrorResponse(404, 'SCORE_NOT_FOUND', 'Score not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      createSuccessResponse(updatedScore, 'Score updated successfully'),
      { status: 200 }
    )
  } catch (error) {
    console.error('PUT /api/scores error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scoreId = searchParams.get('scoreId')
    const userId = searchParams.get('userId')

    if (!scoreId || !userId) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_FIELDS', 'Score ID and User ID are required'),
        { status: 400 }
      )
    }

    const success = await scoreService.deleteScore(scoreId)

    if (!success) {
      return NextResponse.json(
        createErrorResponse(404, 'SCORE_NOT_FOUND', 'Score not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      createSuccessResponse(null, 'Score deleted successfully'),
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/scores error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}