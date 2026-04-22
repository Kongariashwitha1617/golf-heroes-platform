import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'
import { signUp } from '@/lib/auth'
import { profileService } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, charityId, charityPercent } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        createErrorResponse(400, 'MISSING_FIELDS', 'Email, password, and full name are required'),
        { status: 400 }
      )
    }

    const result = await signUp(email, password, fullName)

    if (result.error) {
      console.error('Signup error details:', {
        email,
        error: result.error,
        errorType: typeof result.error
      })
      
      // Check if it's a rate limit error
      if (result.error?.includes('rate limit') || result.error?.includes('too many requests')) {
        return NextResponse.json(
          createErrorResponse(429, 'RATE_LIMIT', 'Too many signup attempts. Please try again later.'),
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        createErrorResponse(400, 'SIGNUP_FAILED', result.error),
        { status: 400 }
      )
    }

    // Create user profile with charity preferences
    if (result.userId) {
      const profile = await profileService.createProfile({
        id: result.userId,
        full_name: fullName,
        email: email,
        role: 'subscriber',
        charity_id: charityId || null,
        charity_percent: charityPercent || 10,
      })

      if (!profile) {
        console.error('Profile creation failed')
        return NextResponse.json(
          createErrorResponse(500, 'PROFILE_CREATION_FAILED', 'Failed to create user profile'),
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      createSuccessResponse({
        userId: result.userId,
        message: 'Account created successfully'
      }, 'Sign up successful'),
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/auth/signup error:', error)
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    )
  }
}
