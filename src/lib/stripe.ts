import Stripe from 'stripe'
import { loadStripe, type Stripe as StripeJs } from '@stripe/stripe-js'

// ============================================
// SERVER-SIDE STRIPE INSTANCE
// ============================================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
})

// ============================================
// CLIENT-SIDE STRIPE.JS
// ============================================

let stripePromise: Promise<StripeJs | null>

export const getStripe = async (): Promise<StripeJs | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// ============================================
// STRIPE CHECKOUT SESSION
// ============================================

export interface CreateCheckoutSessionParams {
  customerId: string
  priceId: string
  userEmail: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export async function createCheckoutSession({
  customerId,
  priceId,
  userEmail,
  successUrl,
  cancelUrl,
  metadata,
}: CreateCheckoutSessionParams): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_email: userEmail,
        ...metadata,
      },
    })

    return session.url
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return null
  }
}

// ============================================
// STRIPE CUSTOMER MANAGEMENT
// ============================================

export async function createCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<string | null> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    })
    return customer.id
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    return null
  }
}

export async function updateCustomer(
  customerId: string,
  updates: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.update(customerId, updates)
    return customer
  } catch (error) {
    console.error('Error updating Stripe customer:', error)
    return null
  }
}

export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return customer as Stripe.Customer
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error)
    return null
  }
}

// ============================================
// STRIPE SUBSCRIPTION MANAGEMENT
// ============================================

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.cancel(subscriptionId)
    return true
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return false
  }
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, updates)
    return subscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    return null
  }
}

// ============================================
// STRIPE EVENT HANDLING
// ============================================

export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    return event
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}

// ============================================
// STRIPE PRICE & PRODUCT HELPERS
// ============================================

export async function getPrice(priceId: string): Promise<Stripe.Price | null> {
  try {
    const price = await stripe.prices.retrieve(priceId)
    return price
  } catch (error) {
    console.error('Error retrieving price:', error)
    return null
  }
}

export async function getProduct(productId: string): Promise<Stripe.Product | null> {
  try {
    const product = await stripe.products.retrieve(productId)
    return product
  } catch (error) {
    console.error('Error retrieving product:', error)
    return null
  }
}

// ============================================
// REFUND HANDLING
// ============================================

export async function createRefund(
  chargeId: string,
  amount?: number
): Promise<Stripe.Refund | null> {
  try {
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount,
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    return null
  }
}

// ============================================
// INVOICE HELPERS
// ============================================

export async function getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId)
    return invoice
  } catch (error) {
    console.error('Error retrieving invoice:', error)
    return null
  }
}

export async function getCustomerInvoices(
  customerId: string,
  limit = 10
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    })
    return invoices.data
  } catch (error) {
    console.error('Error retrieving customer invoices:', error)
    return []
  }
}