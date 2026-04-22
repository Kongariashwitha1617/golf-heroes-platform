import { NextRequest, NextResponse } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'
import { signIn } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_CREDENTIALS', 'Email and password are required'),
        { status: 400 }
      )
    }

    const result = await signIn(email, password)

    if (result.error) {
      return NextResponse.json(
        createErrorResponse(401, 'INVALID_CREDENTIALS', 'Invalid email or password'),
        { status: 401 }
      )
    }

    if (!result?.user) {
      return NextResponse.json(
        createErrorResponse(401, 'AUTH_FAILED', 'Authentication failed'),
        { status: 401 }
      )
    }

    return NextResponse.json(
      createSuccessResponse({
        user: result.user,
        session: null // We'll handle session on client side
      }, 'Login successful'),
      { status: 200 }
    )
  } catch (error) {
    console.error('POST /api/auth/login error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}
