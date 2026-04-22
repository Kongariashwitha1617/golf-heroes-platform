import { NextRequest, NextResponse } from 'next/server'
import { charityService } from '@/lib/supabase'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const charities = await charityService.getCharities(false)
    
    return NextResponse.json(
      createSuccessResponse(charities)
    )
  } catch (error) {
    console.error('Error fetching charities:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Failed to fetch charities'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, image_url, is_featured, is_active } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_FIELDS', 'Name is required'),
        { status: 400 }
      )
    }
    
    const newCharity = await charityService.createCharity({
      name,
      description,
      image_url,
      is_featured: is_featured || false,
      is_active: is_active !== undefined ? is_active : true,
    })

    if (!newCharity) {
      return NextResponse.json(
        createErrorResponse(500, 'CREATE_FAILED', 'Failed to create charity'),
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      createSuccessResponse(newCharity, 'Charity created successfully'),
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating charity:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Failed to create charity'),
      { status: 500 }
    )
  }
}