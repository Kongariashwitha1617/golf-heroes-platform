-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('subscriber', 'admin')) DEFAULT 'subscriber',
  charity_id uuid REFERENCES charities(id) ON DELETE SET NULL,
  charity_percent integer NOT NULL CHECK (charity_percent >= 10 AND charity_percent <= 100) DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Charities table
CREATE TABLE charities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  image_url text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'lapsed')) DEFAULT 'active',
  renewal_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Scores table (golf scores in Stableford format 1-45)
CREATE TABLE scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score_value integer NOT NULL CHECK (score_value >= 1 AND score_value <= 45),
  score_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

-- Draws table (monthly draws)
CREATE TABLE draws (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'simulated', 'published')) DEFAULT 'pending',
  draw_numbers integer[] NOT NULL DEFAULT ARRAY[]::integer[],
  jackpot_rollover numeric(12,2) NOT NULL DEFAULT 0.00,
  total_pool numeric(12,2) NOT NULL DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_draw_month_year UNIQUE (month, year)
);

-- Prize pools table
CREATE TABLE prize_pools (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  total_pool numeric(12,2) NOT NULL,
  tier_5_amount numeric(12,2) NOT NULL,
  tier_4_amount numeric(12,2) NOT NULL,
  tier_3_amount numeric(12,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Draw entries (one per user per draw, storing their 5 numbers and match results)
CREATE TABLE draw_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  matched_numbers integer[] DEFAULT ARRAY[]::integer[],
  match_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_user_draw UNIQUE (draw_id, user_id)
);

-- Prizes table (actual winnings)
CREATE TABLE prizes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id uuid NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier integer NOT NULL CHECK (tier IN (3, 4, 5)),
  amount numeric(12,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'paid')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Winner proofs (verification uploads)
CREATE TABLE winner_proofs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  prize_id uuid NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  admin_status text NOT NULL CHECK (admin_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_profiles_charity_id ON profiles(charity_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_scores_user_id ON scores(user_id);
CREATE INDEX idx_scores_score_date ON scores(score_date);
CREATE INDEX idx_draws_status ON draws(status);
CREATE INDEX idx_draws_month_year ON draws(month, year);
CREATE INDEX idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX idx_prizes_draw_id ON prizes(draw_id);
CREATE INDEX idx_prizes_user_id ON prizes(user_id);
CREATE INDEX idx_prizes_status ON prizes(status);
CREATE INDEX idx_winner_proofs_prize_id ON winner_proofs(prize_id);
CREATE INDEX idx_winner_proofs_admin_status ON winner_proofs(admin_status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_proofs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view all active profiles publicly" ON profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for scores
CREATE POLICY "Users can view their own scores" ON scores
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own scores" ON scores
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own scores" ON scores
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own scores" ON scores
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all scores" ON scores
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for charities (all can view, only admins can edit)
CREATE POLICY "Anyone can view active charities" ON charities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all charities" ON charities
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage charities" ON charities
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for draws (subscribers can view published, admins can view all)
CREATE POLICY "Anyone can view published draws" ON draws
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can view and manage draws" ON draws
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for draw entries
CREATE POLICY "Users can view their own draw entries" ON draw_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all draw entries" ON draw_entries
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for prizes
CREATE POLICY "Users can view their own prizes" ON prizes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all prizes" ON prizes
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for winner proofs
CREATE POLICY "Users can view their own proofs" ON winner_proofs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can upload their own proofs" ON winner_proofs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all proofs" ON winner_proofs
  FOR ALL USING (
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Add virtual column flag to track active field in profiles (for security)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON draws
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at BEFORE UPDATE ON prizes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
