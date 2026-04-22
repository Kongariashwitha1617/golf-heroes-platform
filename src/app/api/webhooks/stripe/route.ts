import { NextRequest, NextResponse } from 'next/server'
import { stripe, constructWebhookEvent } from '@/lib/stripe'
import { subscriptionService, profileService } from '@/lib/supabase'
import type { Stripe } from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  // Verify webhook signature
  const event = constructWebhookEvent(body, signature, webhookSecret)

  if (!event) {
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      // ============================================
      // CHECKOUT SESSION COMPLETED
      // ============================================
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      // ============================================
      // SUBSCRIPTION UPDATED
      // ============================================
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break

      // ============================================
      // SUBSCRIPTION DELETED (CANCELLED)
      // ============================================
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break

      // ============================================
      // PAYMENT FAILED
      // ============================================
      case 'invoice.payment_failed':
        await handlePaymentFailed(
          event.data.object as Stripe.Invoice
        )
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.customer || !session.metadata?.user_id) {
    console.error('Missing customer or user_id in session')
    return
  }

  const userId = session.metadata.user_id as string
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!subscriptionId) {
    console.error('No subscription ID from completed session')
    return
  }

  // Get subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  )

  // Determine plan type
  const price = stripeSubscription.items.data[0]?.price
  const plan = price?.type === 'recurring' && price?.recurring?.interval === 'year' ? 'yearly' : 'monthly'

  // Calculate renewal date
  const currentPeriodEnd = stripeSubscription.current_period_end
  const renewalDate = new Date(currentPeriodEnd * 1000).toISOString()

  // Create subscription in database
  await subscriptionService.createSubscription({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    plan: plan as 'monthly' | 'yearly',
    status: 'active',
    renewal_date: renewalDate,
  })

  console.log(`Subscription created for user ${userId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id

  // Get subscription from database
  const dbSubscription = await subscriptionService.getSubscriptionByStripeId(
    stripeSubscriptionId
  )

  if (!dbSubscription) {
    console.error(`Subscription not found: ${stripeSubscriptionId}`)
    return
  }

  // Update status
  const status = subscription.status as 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'
  const dbStatus = status === 'active' ? 'active' : status === 'canceled' ? 'cancelled' : 'inactive'

  // Update renewal date
  const currentPeriodEnd = subscription.current_period_end
  const renewalDate = new Date(currentPeriodEnd * 1000).toISOString()

  await subscriptionService.updateSubscription(dbSubscription.id, {
    status: dbStatus,
    renewal_date: renewalDate,
  })

  console.log(`Subscription updated: ${dbSubscription.id} -> ${dbStatus}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id

  // Get subscription from database
  const dbSubscription = await subscriptionService.getSubscriptionByStripeId(
    stripeSubscriptionId
  )

  if (!dbSubscription) {
    console.error(`Subscription not found: ${stripeSubscriptionId}`)
    return
  }

  // Mark as cancelled
  await subscriptionService.updateSubscription(dbSubscription.id, {
    status: 'cancelled',
  })

  console.log(`Subscription cancelled: ${dbSubscription.id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) {
    console.error('Invoice has no subscription')
    return
  }

  const stripeSubscriptionId = invoice.subscription as string

  // Get subscription from database
  const dbSubscription = await subscriptionService.getSubscriptionByStripeId(
    stripeSubscriptionId
  )

  if (!dbSubscription) {
    console.error(`Subscription not found: ${stripeSubscriptionId}`)
    return
  }

  // Mark as inactive (lapsed)
  await subscriptionService.updateSubscription(dbSubscription.id, {
    status: 'lapsed',
  })

  console.log(`Subscription lapsed due to failed payment: ${dbSubscription.id}`)
}
