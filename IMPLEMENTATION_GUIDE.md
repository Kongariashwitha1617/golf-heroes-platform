# Golf Heroes Platform - Complete Implementation Guide

## ✅ COMPLETED (Phase 1)
- Database schema with RLS policies
- All TypeScript types and interfaces
- Supabase client with all CRUD services
- Stripe configuration and helpers
- Prize calculator module
- Draw engine module
- 40+ utility functions (validation, formatting, calculations)
- Custom hooks (useUser, useScores, useSubscription)
- Authentication utilities (signUp, signIn,signOut, etc.)
- Middleware for route protection and authorization
- Core UI components (Button, Card, Badge, Modal, LoadingSpinner)

## 📋 REMAINING IMPLEMENTATION (Priority Order)

### PHASE 2: Authentication Pages (CRITICAL)
**Files to create:**
- `src/app/(auth)/login/page.tsx` - Login form with email/password
- `src/app/(auth)/signup/page.tsx` - Signup with charity selection
- `src/app/(auth)/layout.tsx` - Auth layout with navbar

**Key features:**
- Email/password authentication via Supabase Auth
- Form validation with error messages
- Redirect to dashboard on success
- Link to forgot password flow

---

### PHASE 3: Landing Pages (PUBLIC)
**Files to create:**
- `src/app/page.tsx` - Homepage with sections
- `src/components/landing/Navbar.tsx` - Navigation
- `src/components/landing/Hero.tsx` -Hero section with CTA
- `src/components/landing/HowItWorks.tsx` - 4-step process
- `src/components/landing/CharitySection.tsx` - Featured charities
- `src/components/landing/PricingSection.tsx` - Price cards
- `src/components/landing/Footer.tsx` - Footer links

**Key features:**
- Emotion-driven design (highlight charity impact)
- Responsive layout
- Clear CTAs (Subscribe buttons)
- Charity showcase
- Pricing comparison

---

### PHASE 4: Dashboard Pages (SUBSCRIBER)
**Files to create:**
- `src/app/(dashboard)/layout.tsx` - Sidebar + header layout
- `src/app/(dashboard)/dashboard/page.tsx` - Overview
- `src/app/(dashboard)/scores/page.tsx` - Score management
- `src/app/(dashboard)/charity/page.tsx` - Charity selection
- `src/app/(dashboard)/draws/page.tsx` - Draw history
- `src/components/dashboard/*` - Dashboard components

**Components needed:**
- `ScoreEntry.tsx` - Form to add/edit scores (1-45, with date picker)
- `ScoreList.tsx` - Table showing 5 scores in reverse chrono order
- `SubscriptionCard.tsx` - Renewal date, plan type, status badge
- `CharityCard.tsx` - Current charity, percentage selector (10-100%)
- `DrawHistory.tsx` - Table of past draws with results
- `WinningsCard.tsx` - Total won, pending count, tier breakdown
- `DrawParticipation.tsx` - Upcoming draw info, entry status

---

### PHASE 5: Admin Dashboard (ADMIN ONLY)
**Files to create:**
- `src/app/(admin)/layout.tsx` - Admin sidebar layout
- `src/app/(admin)/admin/page.tsx` - Analytics overview
- `src/app/(admin)/admin/users/page.tsx` - User table, edit, delete
- `src/app/(admin)/admin/draws/page.tsx` - Create/simulate/publish draws
- `src/app/(admin)/admin/charities/page.tsx` - CRUD charities
- `src/app/(admin)/admin/winners/page.tsx` - Verify proofs
- `src/app/(admin)/admin/reports/page.tsx` - Statistics

**Components needed:**
- `UserTable.tsx` - Paginated user list, edit forms, bulk actions
- `DrawManager.tsx` - Create draw, run simulation, publish, view results
- `CharityManager.tsx` - Add/edit/delete charities, image upload
- `WinnerVerification.tsx` - Review proofs, approve/reject, mark paid
- `ReportsPanel.tsx` - Charts: users, pool size, charity contributions

---

### PHASE 6: API Routes (BACKEND)
**Files to create:**

#### Authentication
- `src/app/api/auth/callback/route.ts` - OAuth callback handler
- `src/app/api/auth/refresh/route.ts` - Session refresh

#### Subscriptions
- `src/app/api/subscriptions/route.ts` - Create/get subscriptions
- `src/app/api/subscriptions/[id]/route.ts` - Update subscription

#### Stripe
- `src/app/api/stripe/checkout/route.ts` - Create checkout session
- `src/app/api/stripe/customer/route.ts` - Manage customers
- `src/app/api/webhooks/stripe/route.ts` - Handle webhook events

#### Scores
- `src/app/api/scores/route.ts` - List/create scores
- `src/app/api/scores/[id]/route.ts` - Update/delete scores

#### Draws
- `src/app/api/draws/route.ts` - List/create draws
- `src/app/api/draws/[id]/route.ts` - Get draw, update status
- `src/app/api/draws/[id]/simulate/route.ts` - Run simulation
- `src/app/api/draws/[id]/publish/route.ts` - Publish results

#### Charities
- `src/app/api/charities/route.ts` - List/create charities
- `src/app/api/charities/[id]/route.ts` - Update/delete charity

#### Winners & Verification
- `src/app/api/winners/route.ts` - List winners
- `src/app/api/proofs/route.ts` - Upload proof
- `src/app/api/proofs/[id]/verify/route.ts` - Admin verify

---

### PHASE 7: Additional Features
**Email Notifications** (using Supabase Email / SendGrid):
- Verification email on signup
- Draw result email
- Winner notification email
- Payout completed email

**File Upload** (using Supabase Storage):
- Winner proof image upload
- Charity logo upload
- Profile avatar upload

---

## 🔧 SETUP INSTRUCTIONS

### 1. Supabase Setup
```bash
# Run migration in Supabase SQL Editor
# Copy content of supabase/migrations/001_initial_schema.sql
# Run it in your Supabase project
```

### 2. Environment Variables
Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
STRIPE_SECRET_KEY=your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=your_price_id
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=your_price_id
```

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
npm install -D @types/node @types/react
```

### 4. Install SSR package for Supabase
```bash
npm install @supabase/ssr
```

---

## 🧪 TESTING CHECKLIST

### Authentication
- [ ] Sign up with email (creates profile with subscriber role)
- [ ] Verify email link works
- [ ] Sign in with credentials
- [ ] Sign out clears session
- [ ] Protected routes redirect to login
- [ ] Admin routes check role

### Subscriptions
- [ ] Checkout creates Stripe customer
- [ ] Webhook updates database on payment success
- [ ] Subscription status shows correctly
- [ ] Renewal date displays
- [ ] Inactive subscription restricts features

### Scores
- [ ] Add score (1-45 validation)
- [ ] Reject future dates
- [ ] Reject duplicate dates
- [ ] Auto-delete oldest when 6th score added
- [ ] Latest 5 display correctly
- [ ] Edit/delete works

### Draws
- [ ] Create draw for month/year
- [ ] Generate 5 unique random numbers
- [ ] Simulate matches algorithm
- [ ] Calculate correct prize amounts
- [ ] Publish results
- [ ] Rollover jackpot if no 5-match winner

### Winner Verification
- [ ] Upload proof file
- [ ] Admin reviews proof
- [ ] Mark payout complete
- [ ] User sees confirmation

### Charity
- [ ] Select charity at signup
- [ ] Update percentage (10-100)
- [ ] Calculate contribution amount
- [ ] Display on dashboard

---

## 📊 KEY CALCULATIONS

### Prize Pool Distribution
- Total Pool = (Active Subscribers × $6/month avg)
- Tier 5 (Jackpot) = 40% + rollover
- Tier 4 = 35%
- Tier 3 = 25%

### Single Payout
- If 2 tier-4 winners and $100 in tier-4 pool
- Each winner gets $50

### Subscription Contribution
- Monthly ($9.99): ~$6 to pool, ~$3.99 base
- Yearly ($99.99): ~$60 to pool
- User charity percent cuts into subscription (not pool)

---

## 🚀 DEPLOYMENT

### Vercel
1. Connect GitHub repo
2. Add environment variables in dashboard
3. Deploy (auto on push to main)

### Supabase
1. Run migration in SQL Editor
2. Enable RLS on all tables (already in schema)
3. Configure Auth providers (GitHub, Google)
4. Setup Webhooks for Stripe

### Stripe
1. Create products: "Monthly" $9.99, "Yearly" $99.99
2. Create prices (recurring, monthly/yearly billing)
3. Create webhook endpoint: `https://yourdomain/api/webhooks/stripe`
4. Add events: checkout.session.completed, subscription.updated, subscription.deleted

---

## 📁 FILE STRUCTURE SUMMARY

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx [CREATE]
│   │   ├── signup/page.tsx [CREATE]
│   │   └── layout.tsx [CREATE]
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx [CREATE]
│   │   ├── scores/page.tsx [CREATE]
│   │   ├── charity/page.tsx [CREATE]
│   │   ├── draws/page.tsx [CREATE]
│   │   └── layout.tsx [CREATE]
│   ├── (admin)/
│   │   ├── admin/page.tsx [CREATE]
│   │   ├── admin/users/page.tsx [CREATE]
│   │   ├── admin/draws/page.tsx [CREATE]
│   │   ├── admin/charities/page.tsx [CREATE]
│   │   ├── admin/winners/page.tsx [CREATE]
│   │   ├── admin/reports/page.tsx [CREATE]
│   │   └── layout.tsx [CREATE]
│   ├── api/
│   │   ├── auth/[action]/route.ts [CREATE]
│   │   ├── subscriptions/route.ts [CREATE]
│   │   ├── stripe/checkout/route.ts [CREATE]
│   │   ├── webhooks/stripe/route.ts [CREATE]
│   │   ├── scores/route.ts [CREATE]
│   │   ├── draws/route.ts [CREATE]
│   │   ├── charities/route.ts [CREATE]
│   │   └── more as needed [CREATE]
│   ├── page.tsx [CREATE - landing]
│   ├── layout.tsx [DONE]
│   └── globals.css [DONE]
├── components/
│   ├── landing/
│   │   ├── Navbar.tsx [CREATE]
│   │   ├── Hero.tsx [CREATE]
│   │   ├── HowItWorks.tsx [CREATE]
│   │   ├── CharitySection.tsx [CREATE]
│   │   ├── PricingSection.tsx [CREATE]
│   │   └── Footer.tsx [CREATE]
│   ├── dashboard/
│   │   ├── ScoreEntry.tsx [CREATE]
│   │   ├── ScoreList.tsx [CREATE]
│   │   ├── SubscriptionCard.tsx [CREATE]
│   │   ├── CharityCard.tsx [CREATE]
│   │   ├── DrawHistory.tsx [CREATE]
│   │   └── WinningsCard.tsx [CREATE]
│   ├── admin/
│   │   ├── UserTable.tsx [CREATE]
│   │   ├── DrawManager.tsx [CREATE]
│   │   ├── CharityManager.tsx [CREATE]
│   │   ├── WinnerVerification.tsx [CREATE]
│   │   └── ReportsPanel.tsx [CREATE]
│   └── ui/
│       ├── Button.tsx [✓ DONE]
│       ├── Card.tsx [✓ DONE]
│       ├── Badge.tsx [✓ DONE]
│       ├── Modal.tsx [✓ DONE]
│       └── LoadingSpinner.tsx [✓ DONE]
├── lib/
│   ├── supabase.ts [✓ DONE]
│   ├── stripe.ts [✓ DONE]
│   ├── utils.ts [✓ DONE]
│   ├── auth.ts [✓ DONE]
│   ├── draw-engine.ts [✓ DONE]
│   └── prize-calculator.ts [✓ DONE]
├── hooks/
│   ├── useUser.ts [✓ DONE]
│   ├── useScores.ts [✓ DONE]
│   └── useSubscription.ts [✓ DONE]
├── types/
│   ├── database.ts [✓ DONE]
│   └── index.ts [✓ DONE]
└── middleware.ts [✓ DONE]

supabase/
└── migrations/
    └── 001_initial_schema.sql [✓ DONE]
```

---

## 💡 QUICK START FOR REMAINING WORK

For each page/API route, follow this pattern:

### Page Template
```tsx
'use client'

import { useUser } from '@/hooks/useUser'
import { useSubscription } from '@/hooks/useSubscription'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function PageName() {
  const { user, loading } = useUser()

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <div>
      {/* Page content */}
    </div>
  )
}
```

### API Route Template
```ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createErrorResponse, createSuccessResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(createErrorResponse(401, 'UNAUTHORIZED', 'Not authenticated'), { status: 401 })
    }

    // Your logic here

    return NextResponse.json(createSuccessResponse(data))
  } catch (error) {
    return NextResponse.json(
      createErrorResponse(500, 'INTERNAL_ERROR', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}
```

---

## 🔐 Security Considerations

- ✓ RLS policies protecting all tables
- ✓ Middleware checking auth before dashboard/admin access
- ✓ Admin role check on admin routes
- ✓ Webhook signature verification for Stripe
- ✓ HTTPS enforced in middleware
- ✓ Environment variables not exposed to client (except NEXT_PUBLIC_ ones)

---

## 📞 Support & Debugging

If pages aren't loading:
1. Check middleware.ts for route protection
2. Verify Supabase connection: `curl $NEXT_PUBLIC_SUPABASE_URL`
3. Check browser console for errors
4. Verify env vars in Vercel dashboard

If Stripe isn't working:
1. Verify webhook secret is correct
2. Check Stripe dashboard for webhook logs
3. Ensure priceIDs match between Stripe and code

If database queries fail:
1. Check RLS policies allow theuser
2. Verify user is authenticated
3. Run migration again if schema mismatch

---

**Total Estimated Lines of Code to Write:** ~5,000-7,000 lines
**Estimated Time to Complete:** 15-20 hours of focused development
**Complexity:** Medium-High (coordination required across Auth, Stripe, Database)
