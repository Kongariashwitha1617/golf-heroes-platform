# Golf Heroes Platform

A comprehensive golf management platform combining score tracking, charitable giving, and lottery draws.

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: Tailwind CSS with custom components
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel (auto-deploy from GitHub)

## Key Features

### User Features
- **Authentication**: Secure signup/login with role-based access
- **Score Tracking**: Record and manage golf scores with statistics
- **Charity Integration**: Select and support charitable causes
- **Draw Participation**: Enter monthly golf lottery draws
- **Personal Dashboard**: Statistics, recent scores, and upcoming draws

### Admin Features
- **User Management**: View and manage all user accounts
- **Draw Management**: Create, edit, and publish monthly draws
- **Charity Management**: Add/edit/delete charitable organizations
- **Analytics Dashboard**: Real-time platform statistics and reports
- **Subscription Oversight**: Monitor user subscriptions and revenue
- **Score Analytics**: View all user scores and rankings

## User Roles

- **Regular Users**: Track scores, participate in draws, manage charity preferences
- **Admins**: Full platform management, user oversight, analytics access
- **Role Assignment**: Manual admin assignment in database, default subscriber role

## Important Routes

### Public Routes
- `/` - Landing page
- `/login` - User authentication
- `/signup` - User registration

### User Dashboard
- `/dashboard` - Main user dashboard with statistics
- `/dashboard/scores` - Personal score management
- `/dashboard/charity` - Charity selection and preferences
- `/dashboard/draws` - Draw participation

### Admin Panel
- `/admin` - Admin dashboard with platform statistics
- `/admin/users` - User account management
- `/admin/draws` - Draw lifecycle management
- `/admin/charities` - Charity organization management
- `/admin/reports` - Platform analytics and reporting
- `/admin/subscriptions` - Subscription monitoring
- `/admin/scores` - Score analytics and management

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd golf-heroes-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Database Setup

1. Create Supabase project
2. Run provided SQL migration scripts
3. Set up Row Level Security policies
4. Create initial admin user in profiles table
5. Add sample charities and test data

## Deployment

The application auto-deploys to Vercel when pushed to the main branch:

1. **Push code** to GitHub main branch
2. **Vercel automatically** builds and deploys
3. **Monitor deployment** in Vercel dashboard
4. **Test live application** at deployed URL

**Production Environment Variables**: Configure all variables from `.env.local` in Vercel settings.

## Database Structure

### Core Tables
- **profiles**: User accounts with roles and preferences
- **subscriptions**: User subscription plans and billing
- **scores**: Golf score tracking with dates
- **draws**: Monthly lottery draws with winning numbers
- **charities**: Charitable organizations and metadata
- **prizes**: Prize winnings and distribution

### Key Relationships
- Users have one subscription and multiple scores
- Draws contain multiple prizes and user entries
- Users select one charity and contribution percentage
- All tables implement Row Level Security (RLS)

## Folder Structure

```
src/
app/                    # Next.js App Router
  (auth)/              # Authentication routes
  (dashboard)/         # User dashboard features
  (admin)/             # Admin management panel
components/            # Reusable UI components
  ui/                 # Base UI components
lib/                  # Utilities and services
  auth/               # Authentication helpers
  supabase/           # Database services
types/                # TypeScript definitions
middleware.ts         # Route protection
```

## Development Guidelines

- Use TypeScript for type safety
- Follow existing component patterns
- Implement proper error handling
- Test with both user and admin roles
- Use responsive design principles
- Follow Tailwind CSS conventions

---

*Built with Next.js 14, Supabase, and modern web technologies.*
