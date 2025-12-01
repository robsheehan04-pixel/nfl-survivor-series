-- NFL Survivor Series Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- ============================================
-- SERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  current_week INTEGER DEFAULT 1,
  season INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  is_active BOOLEAN DEFAULT true,
  prize_value DECIMAL(10, 2) DEFAULT 0,
  show_prize_value BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active series
CREATE INDEX IF NOT EXISTS idx_series_active ON series(is_active);
CREATE INDEX IF NOT EXISTS idx_series_created_by ON series(created_by);

-- ============================================
-- SERIES MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS series_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lives_remaining INTEGER DEFAULT 2,
  is_eliminated BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_series_members_series ON series_members(series_id);
CREATE INDEX IF NOT EXISTS idx_series_members_user ON series_members(user_id);

-- ============================================
-- PICKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  team_id TEXT NOT NULL,
  result TEXT DEFAULT 'pending' CHECK (result IN ('pending', 'win', 'loss')),
  is_auto_pick BOOLEAN DEFAULT false,
  picked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, user_id, week)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_picks_series ON picks(series_id);
CREATE INDEX IF NOT EXISTS idx_picks_user ON picks(user_id);
CREATE INDEX IF NOT EXISTS idx_picks_week ON picks(week);

-- ============================================
-- INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, email)
);

-- Index for looking up invitations by email
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_series ON invitations(series_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DROP EXISTING POLICIES (to allow re-running)
-- ============================================
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Series viewable by members and invitees" ON series;
DROP POLICY IF EXISTS "Series publicly readable" ON series;
DROP POLICY IF EXISTS "Users can create series" ON series;
DROP POLICY IF EXISTS "Creator can update series" ON series;
DROP POLICY IF EXISTS "Members viewable by series members" ON series_members;
DROP POLICY IF EXISTS "Users can join series" ON series_members;
DROP POLICY IF EXISTS "Users can update own membership" ON series_members;
DROP POLICY IF EXISTS "Users can leave series" ON series_members;
DROP POLICY IF EXISTS "Picks viewable by series members" ON picks;
DROP POLICY IF EXISTS "Users can make picks" ON picks;
DROP POLICY IF EXISTS "Users can update own picks" ON picks;
DROP POLICY IF EXISTS "Invitations viewable" ON invitations;
DROP POLICY IF EXISTS "Members can invite" ON invitations;
DROP POLICY IF EXISTS "Invitees can respond" ON invitations;

-- ============================================
-- POLICIES FOR USERS
-- ============================================

-- Users can read all users (for displaying names/pictures)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

-- ============================================
-- POLICIES FOR SERIES
-- ============================================

-- For non-authenticated access (using anon key with custom auth)
CREATE POLICY "Series publicly readable" ON series
  FOR SELECT USING (true);

-- Users can create series
CREATE POLICY "Users can create series" ON series
  FOR INSERT WITH CHECK (true);

-- Series creator can update
CREATE POLICY "Creator can update series" ON series
  FOR UPDATE USING (true);

-- ============================================
-- POLICIES FOR SERIES_MEMBERS
-- ============================================

-- Members visible to other members of same series
CREATE POLICY "Members viewable by series members" ON series_members
  FOR SELECT USING (true);

-- Users can join series (via invitation acceptance)
CREATE POLICY "Users can join series" ON series_members
  FOR INSERT WITH CHECK (true);

-- Users can update their own membership
CREATE POLICY "Users can update own membership" ON series_members
  FOR UPDATE USING (true);

-- Users can leave series
CREATE POLICY "Users can leave series" ON series_members
  FOR DELETE USING (true);

-- ============================================
-- POLICIES FOR PICKS
-- ============================================

-- Picks viewable by series members
CREATE POLICY "Picks viewable by series members" ON picks
  FOR SELECT USING (true);

-- Users can make their own picks
CREATE POLICY "Users can make picks" ON picks
  FOR INSERT WITH CHECK (true);

-- Users can update their own picks (before deadline)
CREATE POLICY "Users can update own picks" ON picks
  FOR UPDATE USING (true);

-- ============================================
-- POLICIES FOR INVITATIONS
-- ============================================

-- Invitations viewable by invitee or series members
CREATE POLICY "Invitations viewable" ON invitations
  FOR SELECT USING (true);

-- Series members can create invitations
CREATE POLICY "Members can invite" ON invitations
  FOR INSERT WITH CHECK (true);

-- Invitees can update invitation status
CREATE POLICY "Invitees can respond" ON invitations
  FOR UPDATE USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers before recreating
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_series_updated_at ON series;
DROP TRIGGER IF EXISTS on_pick_result_change ON picks;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to process pick result and update lives
CREATE OR REPLACE FUNCTION process_pick_result()
RETURNS TRIGGER AS $$
BEGIN
  -- If pick changed to 'loss', decrement lives
  IF NEW.result = 'loss' AND OLD.result != 'loss' THEN
    UPDATE series_members
    SET
      lives_remaining = lives_remaining - 1,
      is_eliminated = (lives_remaining - 1) <= 0
    WHERE series_id = NEW.series_id AND user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_pick_result_change
  AFTER UPDATE OF result ON picks
  FOR EACH ROW EXECUTE FUNCTION process_pick_result();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for these tables (ignore errors if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE series;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE series_members;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE picks;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE invitations;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
