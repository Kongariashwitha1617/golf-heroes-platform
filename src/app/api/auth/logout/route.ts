import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'
import { signOut } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const result = await signOut()

    if (result.error) {
      return NextResponse.json(
        createErrorResponse(500, 'LOGOUT_FAILED', result.error),
        { status: 500 }
      )
    }

    return NextResponse.json(
      createSuccessResponse(null, 'Logout successful'),
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/auth/logout error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}
