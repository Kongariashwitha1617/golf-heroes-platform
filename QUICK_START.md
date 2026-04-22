# Golf Heroes Platform - Quick Start Guide

**START HERE** - Follow these steps to get the app running locally.

---

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env.local`
Copy and fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxxxx
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_xxxxx
```

### 3. Setup Supabase Database
1. Go to Supabase SQL Editor
2. Create new query
3. Paste entire content of `supabase/migrations/001_initial_schema.sql`
4. Click "Run"
5. Done! Tables are created with RLS policies

### 4. Start the App
```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## 🎯 What's Ready to Use

### Already Implemented (80% core)
- ✅ Landing page (hero, pricing, charities, footer)
- ✅ Login page (fully functional)
- ✅ Signup page (2-step with charity selection)
- ✅ Complete database schema
- ✅ Authentication system
- ✅ Stripe checkout integration
- ✅ Stripe webhook handler

### Ready to Test
1. **Sign Up Flow:**
   - Go to http://localhost:3000/signup
   - Create account with email/password
   - Select a charity (10% contribution)
   - Account created!

2. **Login Flow:**
   - Go to http://localhost:3000/login
   - Use the email/password you just created
   - Should redirect to dashboard

3. **Authentication Check:**
   - Try visiting http://localhost:3000/dashboard
   - Should redirect to /login if not authenticated
   - Log in, then you can access dashboard

---

## 📋 Immediate Next Steps (Priority Order)

### 1. Create Dashboard Layout (30 mins)
**File:** `src/app/(dashboard)/layout.tsx`
- Create sidebar with navigation
- Add responsive layout
- Link to dashboard pages

### 2. Create Dashboard Home Page (1 hour)
**File:** `src/app/(dashboard)/dashboard/page.tsx`
- Display user's subscription status
- Show recent scores (if any)
- Show selected charity
- Display next draw info
- Show total winnings (if any)

### 3. Create Scores Page (2 hours)
**File:** `src/app/(dashboard)/scores/page.tsx`
- Use `useScores` hook to manage scores
- Form to add new score (1-45, date picker)
- Table showing last 5 scores
- Edit/delete buttons for each score
- Validation messages

### 4. Create API Route for Scores (1 hour)
**File:** `src/app/api/scores/route.ts`
- GET: Return user's scores
- POST: Create new score with validation
- PUT: Update score
- DELETE: Remove score

### 5. Test Full Flow (1 hour)
- Signup as new user
- Add 5 golf scores
- Verify they appear in list
- Refresh page - data persists
- Delete a score

---

## 🧠 Code Patterns (Copy-Paste These)

### Page Template
```tsx
'use client'

import { useUser } from '@/hooks/useUser'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function Page() {
  const { user, subscription, loading } = useUser()

  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <div>Not authenticated</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Data</CardTitle>
        </CardHeader>
        <CardContent>
          Welcome, {user.full_name}!
        </CardContent>
      </Card>
    </div>
  )
}
```

### API Route Template
```ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils'

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
      createErrorResponse(500, 'ERROR', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    )
  }
}
```

### Component with Hook
```tsx
'use client'

import { useScores } from '@/hooks/useScores'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ScoresList({ userId }: { userId: string }) {
  const { scores, loading, error, addScore } = useScores(userId)

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div>
      {scores.map((score) => (
        <div key={score.id} className="p-4 border">
          {score.score_value} on {score.score_date}
        </div>
      ))}
      <Button onClick={() => addScore(40, '2024-04-22')}>
        Add Score
      </Button>
    </div>
  )
}
```

---

## 🔗 File Navigation

### Core Files You'll Edit
```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx       [EDIT - Dashboard sidebar]
│   │   ├── dashboard/
│   │   │   └── page.tsx     [CREATE - Overview page]
│   │   ├── scores/
│   │   │   └── page.tsx     [CREATE - Score management]
│   │   ├── charity/
│   │   │   └── page.tsx     [CREATE - Charity selector]
│   │   └── draws/
│   │       └── page.tsx     [CREATE - Draws & winnings]
│   ├── (auth)/
│   │   ├── login/page.tsx   [✅ DONE]
│   │   └── signup/page.tsx  [✅ DONE]
│   ├── api/
│   │   ├── scores/
│   │   │   └── route.ts     [CREATE]
│   │   ├── stripe/
│   │   │   └── checkout/route.ts [✅ DONE]
│   │   └── webhooks/
│   │       └── stripe/route.ts [✅ DONE]
│   └── page.tsx             [✅ DONE - Landing]
├── components/
│   ├── dashboard/
│   │   ├── ScoreEntry.tsx    [CREATE]
│   │   ├── ScoreList.tsx     [CREATE]
│   │   └── ...others
│   └── ui/
│       ├── Button.tsx        [✅ DONE]
│       ├── Card.tsx          [✅ DONE]
│       └── ...others         [✅ DONE]
├── lib/
│   ├── supabase.ts           [✅ DONE]
│   ├── stripe.ts             [✅ DONE]
│   ├── utils.ts              [✅ DONE]
│   └── auth.ts               [✅ DONE]
├── hooks/
│   ├── useUser.ts            [✅ DONE]
│   ├── useScores.ts          [✅ DONE]
│   └── useSubscription.ts    [✅ DONE]
└── middleware.ts             [✅ DONE]
```

---

## 🐛 Debugging Tips

### Check Authentication
```tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAuth() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      console.log('Current user:', data.user)
    })
  }, [])

  return <pre>{JSON.stringify(user, null, 2)}</pre>
}
```

### Check Database Connection
```tsx
'use client'
import { profileService } from '@/lib/supabase'
import { useEffect } from 'react'

export default function DebugDB() {
  useEffect(() => {
    profileService.getAllProfiles(5).then((profiles) => {
      console.log('Profiles:', profiles)
    })
  }, [])

  return <div>Check console</div>
}
```

### Test API Route
```bash
# Test without auth (should fail)
curl http://localhost:3000/api/scores

# Test with Stripe webhook locally
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
stripe trigger customer.subscription.updated
```

---

## 📱 Testing Checklist

Before submitting to review:

### Authentication
- [ ] Signup creates account
- [ ] Email gets verified
- [ ] Login works
- [ ] Logout clears session
- [ ] Protected routes redirect
- [ ] Admin routes check role

### Scores
- [ ] Can add score 1-45
- [ ] Rejects scores outside range
- [ ] Rejects future dates
- [ ] Rejects duplicate dates
- [ ] Shows last 5 scores
- [ ] Edit/delete works
- [ ] Auto-deletes 6th oldest score

### Subscription
- [ ] Checkout redirects to Stripe
- [ ] Webhook updates DB on success
- [ ] Status shows "active"
- [ ] Renewal date displays

### Charity
- [ ] Can select charity
- [ ] Can set percentage (10-100%)
- [ ] Displays on profile

### Draws
- [ ] Draw can be simulated
- [ ] Matching logic works
- [ ] Prizes calculated correctly

---

## 💡 Pro Tips

1. **Use TypeScript** - The types are your documentation
2. **Use the hooks** - `useUser`, `useScores`, `useSubscription` handle all data
3. **Copy components** - UI components are reusable building blocks
4. **Test locally first** - Test everything before deploying
5. **Check the console** - Errors show up in browser console and terminal
6. **Read the types** - If confused, check `src/types/database.ts`
7. **Use the services** - `supabase`, `stripe`, `scoreService`, etc. have all methods
8. **Follow the patterns** - Every page follows a similar structure

---

## 🆘 When Things Break

**Page won't load:**
1. Check browser console for errors
2. Check terminal for Next.js errors
3. Verify environment variables
4. Restart the dev server

**Database errors:**
1. Check RLS policies
2. Verify user is authenticated
3. Check SQL syntax in Supabase
4. Try query in SQL editor first

**Stripe errors:**
1. Verify webhook secret
2. Check Stripe dashboard logs
3. Use Stripe CLI to test locally
4. Verify price IDs match

**Authentication issues:**
1. Check Supabase auth settings
2. Verify user exists in DB
3. Check middleware.ts logic
4. Clear browser cookies and try again

---

## 📞 Need Help?

1. **Check IMPLEMENTATION_GUIDE.md** - Detailed specs
2. **Check SETUP_AND_STATUS.md** - Full architecture
3. **Review existing code** - Examples in completed files
4. **Read function comments** - All utilities have JSDoc
5. **Check TypeScript types** - They document expected data shapes

---

## ✨ What's Next After Basic Setup?

1. ✅ Get auth working
2. ✅ Test login/signup
3. Dashboard pages
4. Score entry system
5. Draw simulation
6. Admin pages
7. Email notifications
8. Deploy to Vercel

---

**Good luck! You've got this! 🚀**

Questions? Check the code - it's well-documented!
