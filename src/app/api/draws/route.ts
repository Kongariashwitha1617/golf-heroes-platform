import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement draws fetching logic
    const mockDraws = [
      {
        id: '1',
        month: 4,
        year: 2026,
        status: 'published',
        draw_numbers: [12, 23, 34, 41, 45],
        jackpot_rollover: 0,
        total_pool: 5000,
        created_at: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(
      createSuccessResponse(mockDraws)
    )
  } catch (error) {
    console.error('Error fetching draws:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Failed to fetch draws'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement draw creation logic
    const { month, year, status, draw_numbers } = await request.json()
    
    if (!month || !year) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_FIELDS', 'Month and year are required'),
        { status: 400 }
      )
    }
    
    const newDraw = {
      id: '1',
      month,
      year,
      status: status || 'pending',
      draw_numbers: draw_numbers || [],
      jackpot_rollover: 0,
      total_pool: 0,
      created_at: new Date().toISOString()
    }
    
    // TODO: Save draw to database
    return NextResponse.json(
      createSuccessResponse(newDraw, 'Draw created successfully'),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating draw:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Failed to create draw'),
      { status: 500 }
    )
  }
}