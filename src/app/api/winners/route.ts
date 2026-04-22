import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'
import { prizeService, profileService } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const drawId = searchParams.get('drawId')
    const status = searchParams.get('status')

    let query = supabase
      .from('prizes')
      .select(`
        *,
        profiles!full_name,
        profiles!email,
        draws!month,
        draws!year
      `)
      .eq('status', status || 'pending')

    if (drawId) {
      query = query.eq('draw_id', drawId)
    }

    const { data: prizes, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('GET /api/winners error:', error)
      return NextResponse.json(
        createErrorResponse(500, 'INTERNAL_ERROR', 'Failed to fetch winners'),
        { status: 500 }
      )
    }

    return NextResponse.json(
      createSuccessResponse(prizes, 'Winners retrieved successfully'),
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/winners error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prizeId, status, proofData } = await request.json()

    if (!prizeId || !status) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_FIELDS', 'Prize ID and status are required'),
        { status: 400 }
      )
    }

    // Update prize status
    const updatedPrize = await prizeService.updatePrize(prizeId, {
      status: status as 'pending' | 'paid',
    })

    if (!updatedPrize) {
      return NextResponse.json(
        createErrorResponse(404, 'PRIZE_NOT_FOUND', 'Prize not found'),
        { status: 404 }
      )
    }

    // If status is 'paid' and proof data is provided, create winner proof record
    if (status === 'paid' && proofData) {
      const { error: proofError } = await supabase
        .from('winner_proofs')
        .insert([{
          prize_id: prizeId,
          proof_data: proofData,
          verified: false,
          created_at: new Date().toISOString(),
        }])

      if (proofError) {
        console.error('Error creating winner proof:', proofError)
        return NextResponse.json(
          createErrorResponse(500, 'PROOF_ERROR', 'Failed to save winner proof'),
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      createSuccessResponse(updatedPrize, 'Prize status updated successfully'),
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/winners error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}