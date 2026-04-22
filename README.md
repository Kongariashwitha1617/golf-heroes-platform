# Golf Heroes Platform

## Table of Contents

- [Project Overview](#project-overview)
- [User Roles & Access](#user-roles--access)
- [Complete URL Routes List](#complete-url-routes-list)
- [Full Feature Documentation](#full-feature-documentation)
- [Supabase Database Structure](#supabase-database-structure)
- [Getting Started (Local Setup)](#getting-started-local-setup)
- [Deployment](#deployment)
- [Testing Guide](#testing-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing & Code Structure](#contributing--code-structure)

---

## Project Overview

**Golf Heroes** is a comprehensive golf management platform that combines golf score tracking with charitable giving and lottery draws. The platform allows users to track their golf performance, participate in monthly draws, and contribute to charitable causes through their subscriptions.

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Custom UI components with Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Deployment**: Vercel (auto-deploy from GitHub)

### Architecture Overview
The application uses Next.js 14's App Router with route groups to separate different user experiences:
- `(auth)` - Authentication pages (login, signup)
- `(dashboard)` - User dashboard and features
- `(admin)` - Admin management panel

---

## User Roles & Access

### Regular User (Subscriber)
- **What they can do**:
  - Sign up and create a profile
  - Track golf scores and view statistics
  - Select and support charitable causes
  - Participate in monthly golf draws
  - View personal dashboard with statistics
  - Manage subscription and profile settings

### Admin
- **What they can do**:
  - Access comprehensive admin dashboard
  - Manage all user accounts and subscriptions
  - Create and manage golf draws
  - Add/edit/delete charities
  - View detailed reports and analytics
  - Manage user scores and rankings
  - Monitor platform statistics

### Role Assignment
- **Default role**: All new users start as 'subscriber'
- **Admin role**: Manually assigned in the database (role field in profiles table)
- **Access control**: Implemented through middleware and route protection

---

## Complete URL Routes List

| Route | Access Level | Description |
|-------|-------------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | User login page |
| `/signup` | Public | User registration page |
| `/dashboard` | User | Main user dashboard |
| `/dashboard/scores` | User | Golf score management |
| `/dashboard/charity` | User | Charity selection and management |
| `/dashboard/draws` | User | View and participate in draws |
| `/admin` | Admin | Admin dashboard |
| `/admin/users` | Admin | User management |
| `/admin/draws` | Admin | Draw management (CRUD) |
| `/admin/charities` | Admin | Charity management (CRUD) |
| `/admin/reports` | Admin | Platform analytics and reports |
| `/admin/subscriptions` | Admin | Subscription management |
| `/admin/scores` | Admin | Score management and analytics |
| `/admin/winners` | Admin | Winner management |

---

## Full Feature Documentation

### Authentication

#### Sign Up
**What it is**: New user registration with profile creation and charity selection

**How to use (User)**:
1. Navigate to `/signup`
2. Fill in email, password, and confirm password
3. Select a charity from the dropdown list
4. Set contribution percentage (10-100%)
5. Click "Complete & Subscribe"
6. User is redirected to login page with success message

**Admin view**: Admin can see new users in `/admin/users` with their registration details

#### Login
**What it is**: User authentication with session management

**How to use (User)**:
1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In"
4. Successful login redirects to `/dashboard`
5. Failed login shows error message

**Admin view**: Same login flow, but redirects to `/admin` for admin users

---

### Dashboard

#### User Dashboard
**What it is**: Personal dashboard showing user statistics and recent activity

**How to use (User)**:
1. Login and navigate to `/dashboard`
2. View 6 statistics cards:
   - My Scores (total scores submitted)
   - Active Draws (current draws entered)
   - Charity Contributions (total amount contributed)
   - My Subscription (current plan status)
   - Draws Won (total wins)
   - Leaderboard Rank (current ranking)
3. Review Recent Scores panel showing last 5 scores
4. Check Upcoming Draws panel for active draws

**Admin view**: Admin sees comprehensive platform statistics at `/admin`

#### Admin Dashboard
**What it is**: Administrative overview of entire platform

**How to use (Admin)**:
1. Login as admin and navigate to `/admin`
2. View platform-wide statistics
3. Use Quick Action buttons to navigate to key admin pages
4. Monitor overall platform health

---

### Scores

#### User Score Management
**What it is**: Track and manage personal golf scores

**How to use (User)**:
1. Navigate to `/dashboard/scores`
2. View all personal golf scores
3. Add new scores with date and value
4. Edit existing scores
5. View score statistics and trends

**CRUD Operations**:
- **Create**: Add new golf score with date and value
- **Read**: View all personal scores with statistics
- **Update**: Edit existing score details
- **Delete**: Remove incorrect scores

#### Admin Score Management
**What it is**: Manage all user scores and platform analytics

**How to use (Admin)**:
1. Navigate to `/admin/scores`
2. View all user scores across platform
3. Filter by user or date range
4. View score statistics and leaderboards
5. Monitor score submission patterns

**CRUD Operations**:
- **Read**: View all scores with user details
- **Update**: Modify score details if needed
- **Delete**: Remove invalid scores

---

### Draws

#### User Draw Participation
**What it is**: View and participate in monthly golf lottery draws

**How to use (User)**:
1. Navigate to `/dashboard/draws`
2. View active and upcoming draws
3. See draw details (pool size, numbers, dates)
4. Check past draws and results
5. View personal draw entries

**Admin view**: Full draw management at `/admin/draws`

#### Admin Draw Management
**What it is**: Complete draw lifecycle management

**How to use (Admin)**:
1. Navigate to `/admin/draws`
2. Click "Create Draw" to add new draw
3. Fill in month, year, winning numbers (5 numbers 1-45)
4. Set total pool and jackpot rollover amounts
5. Save draw as "pending" or "published"
6. Edit existing draws
7. Publish draws when ready

**CRUD Operations**:
- **Create**: New monthly draw with numbers and pool
- **Read**: View all draws with status and details
- **Update**: Modify draw details and status
- **Delete**: Remove cancelled draws

---

### Charities

#### User Charity Selection
**What it is**: Select and support charitable causes

**How to use (User)**:
1. Navigate to `/dashboard/charity`
2. Browse available charities
3. Select preferred charity
4. Set contribution percentage (10-100%)
5. View contribution impact and statistics
6. Change charity selection anytime

**CRUD Operations**:
- **Read**: View all available charities
- **Update**: Change charity selection and percentage

#### Admin Charity Management
**What it is**: Manage charitable organizations

**How to use (Admin)**:
1. Navigate to `/admin/charities`
2. Click "Add Charity" to create new charity
3. Fill in charity name, description, and image URL
4. Set charity as active/featured
5. Edit existing charity details
6. Delete charities with confirmation

**CRUD Operations**:
- **Create**: Add new charitable organization
- **Read**: View all charities with status
- **Update**: Modify charity details and status
- **Delete**: Remove charities (with confirmation)

---

### Subscriptions

#### User Subscription Management
**What it is**: Manage subscription plans and billing

**How to use (User)**:
1. Subscription status shown in dashboard
2. View current plan (Monthly/Yearly)
3. See contribution amounts
4. Manage billing through Stripe integration

**Admin view**: Full subscription oversight at `/admin/subscriptions`

#### Admin Subscription Management
**What it is**: Monitor and manage all user subscriptions

**How to use (Admin)**:
1. Navigate to `/admin/subscriptions`
2. View all active subscriptions
3. Filter by plan type (Monthly/Yearly)
4. Monitor revenue and subscription metrics
5. View user details and billing status

**CRUD Operations**:
- **Read**: View all subscriptions with user details
- **Update**: Modify subscription status if needed

---

### Reports & Analytics

#### Admin Reports
**What it is**: Comprehensive platform analytics and reporting

**How to use (Admin)**:
1. Navigate to `/admin/reports`
2. View real-time platform statistics:
   - Total users and active subscriptions
   - Monthly revenue calculations
   - New signups and engagement metrics
   - Golf scores and draw statistics
3. Click "Generate Report" to refresh data
4. All metrics are self-explanatory with descriptions

**Features**:
- Real database data (no mock data)
- Clear metric labels and descriptions
- Visual icons and color coding
- Responsive design

---

## Supabase Database Structure

### Core Tables

#### profiles
**Purpose**: User account information and preferences
- `id` (UUID) - Primary key, references auth.users
- `full_name` (text) - User's full name
- `email` (text) - User's email address
- `role` (user_role) - 'subscriber' or 'admin'
- `charity_id` (UUID) - Selected charity (nullable)
- `charity_percent` (integer) - Contribution percentage (10-100)
- `created_at`/`updated_at` - Timestamps

#### subscriptions
**Purpose**: User subscription management
- `id` (UUID) - Primary key
- `user_id` (UUID) - References profiles
- `stripe_subscription_id` (text) - Stripe subscription ID
- `stripe_customer_id` (text) - Stripe customer ID
- `plan` (subscription_plan) - 'monthly' or 'yearly'
- `status` (subscription_status) - 'active', 'inactive', etc.
- `renewal_date` (timestamp) - Next renewal date
- `created_at`/`updated_at` - Timestamps

#### scores
**Purpose**: Golf score tracking
- `id` (UUID) - Primary key
- `user_id` (UUID) - References profiles
- `score_value` (integer) - Golf score (1-45)
- `score_date` (date) - Date of score (unique per user)
- `created_at`/`updated_at` - Timestamps

#### draws
**Purpose**: Monthly lottery draws
- `id` (UUID) - Primary key
- `month` (integer) - Month (1-12)
- `year` (integer) - Year (e.g., 2026)
- `status` (draw_status) - 'pending', 'simulated', 'published'
- `draw_numbers` (integer[]) - 5 winning numbers (1-45)
- `jackpot_rollover` (numeric) - Rollover amount
- `total_pool` (numeric) - Prize pool amount
- `created_at`/`updated_at` - Timestamps

#### charities
**Purpose**: Charitable organizations
- `id` (UUID) - Primary key
- `name` (text) - Charity name
- `description` (text) - Charity description (nullable)
- `image_url` (text) - Logo URL (nullable)
- `is_featured` (boolean) - Featured status
- `is_active` (boolean) - Active status
- `created_at`/`updated_at` - Timestamps

#### prizes
**Purpose**: Prize winnings
- `id` (UUID) - Primary key
- `draw_id` (UUID) - References draws
- `user_id` (UUID) - References profiles
- `tier` (prize_tier) - Prize tier (3, 4, or 5)
- `amount` (numeric) - Prize amount
- `status` (prize_status) - 'pending' or 'paid'
- `created_at`/`updated_at` - Timestamps

### Row Level Security (RLS) Policies

**Overview**: All tables have RLS policies to ensure data security

#### Key RLS Policies
- **profiles**: Users can read/write their own profile; admins can read all
- **subscriptions**: Users can read their own subscriptions; admins can read all
- **scores**: Users can read/write their own scores; admins can read all
- **draws**: All authenticated users can read published draws; admins can manage all
- **charities**: Public read access; admins can manage

---

## Getting Started (Local Setup)

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Git

### Step by Step Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd golf-heroes-platform
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Create `.env.local` file in root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (optional, for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

4. **Set up Supabase database**
- Run the provided SQL migration scripts
- Set up Row Level Security policies
- Create initial admin user
- Add sample charities and data

5. **Run the application**
```bash
npm run dev
# or
yarn dev
```

6. **Access the application**
- Open http://localhost:3000
- Test with admin credentials to verify access

### Running with Supabase Connected

1. **Verify Supabase connection**
   - Check environment variables are correct
   - Test authentication flow
   - Verify database connectivity

2. **Test user registration**
   - Create a test user account
   - Verify profile creation in Supabase
   - Check charity selection works

3. **Test admin access**
   - Set a user's role to 'admin' in Supabase
   - Login as admin user
   - Verify admin dashboard loads

---

## Deployment

### Vercel Deployment (GitHub Integration)

**How it works**: The application is automatically deployed to Vercel when code is pushed to the main/master branch of the linked GitHub repository.

### GitHub to Deployment Pipeline
1. **Developer pushes code** to GitHub main branch
2. **GitHub webhook triggers** Vercel deployment
3. **Vercel builds** the Next.js application
4. **Vercel deploys** to production environment
5. **Deployment goes live** automatically

### Production Environment Variables

Required in Vercel environment settings:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_production_stripe_key
STRIPE_SECRET_KEY=your_production_stripe_secret_key
```

### Verifying Successful Deployment

**In Vercel Dashboard**:
1. Navigate to your project
2. Check "Deployments" tab
3. Look for green "Ready" status
4. Click deployment to view build logs
5. Verify no build errors

**Manual Testing**:
1. Visit the deployed URL
2. Test authentication flow
3. Verify database connectivity
4. Check all major features work

---

## Testing Guide

### Major Feature Testing

#### Authentication Testing
**Test User Credentials Format**:
- Email: test@example.com
- Password: minimum 6 characters
- Test both valid and invalid credentials

**Test Steps**:
1. Test user registration flow
2. Verify email/password validation
3. Test login with correct credentials
4. Test login with incorrect credentials
5. Verify redirect after successful login
6. Test logout functionality

#### Dashboard Testing
**User Dashboard**:
1. Login as regular user
2. Verify all 6 statistics cards display
3. Check data accuracy from database
4. Test Recent Scores panel
5. Test Upcoming Draws panel
6. Verify responsive design on mobile

**Admin Dashboard**:
1. Login as admin user
2. Verify platform statistics
3. Test Quick Action navigation
4. Check all admin pages accessible

#### CRUD Operations Testing
**Draws Management**:
1. Create new draw with valid data
2. Edit existing draw
3. Test publishing draw
4. Verify no schema errors
5. Check data persistence

**Charity Management**:
1. Add new charity
2. Edit charity details
3. Test delete functionality
4. Verify confirmation dialogs
5. Check data persists after refresh

#### Score Tracking Testing
1. Add new golf score
2. Edit existing score
3. Verify score calculations
4. Test score history display
5. Check admin score view

### Post-Deployment Testing Checklist

**Critical Path Testing**:
- [ ] User registration works
- [ ] User login/logout works
- [ ] Admin login works
- [ ] Dashboard loads with real data
- [ ] All admin pages accessible
- [ ] CRUD operations work
- [ ] No console errors
- [ ] Responsive design works
- [ ] Database connectivity verified

**Performance Testing**:
- [ ] Page load times acceptable
- [ ] Database queries efficient
- [ ] No memory leaks
- [ ] Mobile performance acceptable

---

## Troubleshooting

### Common Errors and Solutions

#### Supabase RLS Issues
**Error**: "Permission denied for table"
**Solution**: 
- Check RLS policies in Supabase
- Verify user authentication
- Ensure proper policy configuration

**Error**: "No rows returned"
**Solution**:
- Verify data exists in table
- Check RLS policies allow access
- Test with admin role

#### Authentication Issues
**Error**: "Invalid login credentials"
**Solution**:
- Verify user exists in auth.users
- Check email/password format
- Ensure user confirmed email

**Error**: "Session expired"
**Solution**:
- Clear browser storage
- Re-authenticate user
- Check JWT token settings

#### Navigation/Routing 404 Errors
**Error**: Page not found
**Solution**:
- Check route structure in app directory
- Verify file naming conventions
- Ensure proper route group structure

**Error**: Middleware redirect loop
**Solution**:
- Check middleware.ts logic
- Verify role-based redirects
- Test with different user roles

#### Database Connection Issues
**Error**: "Unable to connect to Supabase"
**Solution**:
- Verify environment variables
- Check Supabase project URL
- Test network connectivity

**Error**: "Invalid API key"
**Solution**:
- Verify Supabase keys
- Check key permissions
- Regenerate keys if needed

### Deployment Issues

#### Vercel Build Failures
**Check**:
- Build logs in Vercel dashboard
- Environment variables
- Dependency conflicts
- TypeScript errors

#### Runtime Errors
**Check**:
- Server logs in Vercel
- Environment variables
- Database connectivity
- API endpoint responses

### Debugging Steps

1. **Check browser console** for JavaScript errors
2. **Check Network tab** for failed API calls
3. **Check Supabase logs** for database issues
4. **Check Vercel logs** for deployment issues
5. **Test with different user roles** for permission issues

---

## Contributing & Code Structure

### Folder Structure

```
src/
app/                    # Next.js App Router
  (auth)/              # Authentication routes
    login/
    signup/
  (dashboard)/         # User dashboard routes
    dashboard/
    scores/
    charity/
    draws/
  (admin)/             # Admin routes
    admin/
      users/
      draws/
      charities/
      reports/
      subscriptions/
      scores/
      winners/
  page.tsx            # Landing page
components/            # Reusable UI components
  ui/                 # Base UI components
lib/                  # Utilities and services
  auth/               # Authentication utilities
  supabase/           # Supabase services
types/                # TypeScript type definitions
middleware.ts         # Route protection middleware
```

### Adding New Features

1. **Create route structure**:
   - Add new folder under appropriate route group
   - Create page.tsx file

2. **Add database types**:
   - Update types/database.ts
   - Define interfaces for new tables

3. **Create service functions**:
   - Add to lib/supabase/index.ts
   - Follow existing patterns

4. **Add UI components**:
   - Create reusable components in components/
   - Follow existing styling patterns

5. **Update middleware**:
   - Add route protection if needed
   - Define role-based access

### Naming Conventions

**Files and Folders**:
- kebab-case for folders: `user-management`
- PascalCase for components: `UserProfileCard`
- camelCase for functions: `getUserData`

**Database**:
- snake_case for tables: `user_profiles`
- snake_case for columns: `created_at`
- UUID for primary keys

**Components**:
- Descriptive names: `GolfScoreCard` not `Card`
- Prefix with purpose: `AdminDashboard`, `UserStats`

### Code Patterns

**Service Functions**:
```typescript
// Use async/await
const getUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
```

**Component Structure**:
```typescript
'use client'

import { useState, useEffect } from 'react'
// imports...

export default function ComponentName() {
  const [state, setState] = useState()
  
  useEffect(() => {
    // logic...
  }, [])

  return (
    <div className="p-6">
      {/* JSX */}
    </div>
  )
}
```

### Best Practices

1. **Always handle errors** in service functions
2. **Use loading states** for async operations
3. **Follow responsive design** patterns
4. **Test with different user roles**
5. **Document new features** in README
6. **Use TypeScript** for type safety
7. **Follow existing styling** with Tailwind CSS

---

## Support

For questions or issues:
1. Check this README first
2. Review the troubleshooting section
3. Check existing GitHub issues
4. Create new issue with detailed description

---

*Last updated: April 2026*
