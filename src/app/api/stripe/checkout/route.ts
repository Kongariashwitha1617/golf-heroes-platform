import { NextRequest, NextResponse } from 'next/server'
import { supabase, subscriptionService } from '@/lib/supabase'
import { stripe, createCustomer, createCheckoutSession } from '@/lib/stripe'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        createErrorResponse(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header'),
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json(
        createErrorResponse(401, 'UNAUTHORIZED', 'Invalid or expired token'),
        { status: 401 }
      )
    }

    const { priceId, plan } = await request.json()

    if (!priceId || !plan) {
      return NextResponse.json(
        createErrorResponse(400, 'BAD_REQUEST', 'Missing required fields: priceId, plan'),
        { status: 400 }
      )
    }

    // Check if user already has active subscription
    const existingSubscription = await subscriptionService.getSubscription(user.id)
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        createErrorResponse(400, 'SUBSCRIPTION_EXISTS', 'User already has an active subscription'),
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId: string | undefined = existingSubscription?.stripe_customer_id

    if (!customerId) {
      const customerData = {
        email: user.email || '',
        name: user.user_metadata?.full_name || 'User',
        metadata: {
          user_id: user.id,
        },
      };

      const customer = await createCustomer(
        user.email || '',
        user.user_metadata?.full_name || 'User',
        customerData.metadata
      );

      if (!customer) {
        return NextResponse.json(
          createErrorResponse(500, 'STRIPE_ERROR', 'Failed to create Stripe customer'),
          { status: 500 }
        )
      }

      customerId = customer;
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || process.env.VERCEL_URL

    // Create checkout session
    const checkoutUrl = await createCheckoutSession({
      customerId,
      priceId,
      userEmail: user.email || '',
      successUrl: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/pricing`,
      metadata: {
        user_id: user.id,
      },
    })

    if (!checkoutUrl) {
      return NextResponse.json(
        createErrorResponse(500, 'STRIPE_ERROR', 'Failed to create checkout session'),
        { status: 500 }
      )
    }

    return NextResponse.json(
      createSuccessResponse({
        url: checkoutUrl,
      })
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      createErrorResponse(
        500,
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    )
  }
}
