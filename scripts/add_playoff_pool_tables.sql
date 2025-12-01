-- PLAYOFF POOL TABLES AND COLUMNS
-- Run this in Supabase SQL Editor to add playoff pool support

-- Step 1: Add playoff_stage column to series table
ALTER TABLE series
ADD COLUMN IF NOT EXISTS playoff_stage TEXT DEFAULT 'stage_1';

-- Step 2: Create playoff_picks table for storing bracket picks
CREATE TABLE IF NOT EXISTS playoff_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,  -- e.g., 'wc-afc-1', 'div-nfc-2', 'super-bowl'
  picked_winner_id TEXT NOT NULL,  -- team ID of predicted winner
  predicted_margin INTEGER NOT NULL CHECK (predicted_margin > 0),
  picked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one pick per user per game per series
  UNIQUE(series_id, user_id, game_id)
);

-- Step 3: Create playoff_games table for storing game results
CREATE TABLE IF NOT EXISTS playoff_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,  -- e.g., 'wc-afc-1', 'div-nfc-2', 'super-bowl'
  round TEXT NOT NULL,  -- 'wild_card', 'divisional', 'conference', 'super_bowl'
  conference TEXT NOT NULL,  -- 'AFC', 'NFC', 'SUPER_BOWL'
  away_team_id TEXT NOT NULL,
  home_team_id TEXT NOT NULL,
  game_time TIMESTAMP WITH TIME ZONE,
  is_complete BOOLEAN DEFAULT FALSE,
  home_score INTEGER,
  away_score INTEGER,
  winner_id TEXT,

  -- Unique constraint: one game definition per series
  UNIQUE(series_id, game_id)
);

-- Step 4: Create playoff_results table for storing calculated results
CREATE TABLE IF NOT EXISTS playoff_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  picked_winner_id TEXT NOT NULL,
  predicted_margin INTEGER NOT NULL,
  actual_winner_id TEXT,
  actual_margin INTEGER,
  winner_points INTEGER DEFAULT 0,
  margin_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one result per user per game per series
  UNIQUE(series_id, user_id, game_id)
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_playoff_picks_series ON playoff_picks(series_id);
CREATE INDEX IF NOT EXISTS idx_playoff_picks_user ON playoff_picks(user_id);
CREATE INDEX IF NOT EXISTS idx_playoff_picks_game ON playoff_picks(game_id);
CREATE INDEX IF NOT EXISTS idx_playoff_games_series ON playoff_games(series_id);
CREATE INDEX IF NOT EXISTS idx_playoff_results_series ON playoff_results(series_id);
CREATE INDEX IF NOT EXISTS idx_playoff_results_user ON playoff_results(user_id);

-- Step 6: Enable Row Level Security
ALTER TABLE playoff_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playoff_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE playoff_results ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for playoff_picks
-- Users can view all picks in series they're a member of
CREATE POLICY "Users can view picks in their series"
  ON playoff_picks FOR SELECT
  USING (
    series_id IN (
      SELECT series_id FROM series_members WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own picks
CREATE POLICY "Users can insert their own picks"
  ON playoff_picks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own picks
CREATE POLICY "Users can update their own picks"
  ON playoff_picks FOR UPDATE
  USING (user_id = auth.uid());

-- Step 8: Create RLS policies for playoff_games
-- Anyone in the series can view games
CREATE POLICY "Users can view games in their series"
  ON playoff_games FOR SELECT
  USING (
    series_id IN (
      SELECT series_id FROM series_members WHERE user_id = auth.uid()
    )
  );

-- Only series owner can manage games
CREATE POLICY "Series owner can manage games"
  ON playoff_games FOR ALL
  USING (
    series_id IN (
      SELECT id FROM series WHERE created_by = auth.uid()
    )
  );

-- Step 9: Create RLS policies for playoff_results
-- Anyone in the series can view results
CREATE POLICY "Users can view results in their series"
  ON playoff_results FOR SELECT
  USING (
    series_id IN (
      SELECT series_id FROM series_members WHERE user_id = auth.uid()
    )
  );

-- Step 10: Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('playoff_picks', 'playoff_games', 'playoff_results');

-- Step 11: Verify the playoff_stage column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'series'
AND column_name = 'playoff_stage';
