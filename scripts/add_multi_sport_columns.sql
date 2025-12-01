-- ADD MULTI-SPORT COLUMNS TO SERIES TABLE
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns with default values for existing data
ALTER TABLE series
ADD COLUMN IF NOT EXISTS sport TEXT DEFAULT 'nfl',
ADD COLUMN IF NOT EXISTS competition TEXT DEFAULT 'regular_season',
ADD COLUMN IF NOT EXISTS series_type TEXT DEFAULT 'survivor';

-- Step 2: Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'series'
AND column_name IN ('sport', 'competition', 'series_type');

-- Step 3: Update existing series to have the default values explicitly (optional but recommended)
UPDATE series
SET sport = 'nfl',
    competition = 'regular_season',
    series_type = 'survivor'
WHERE sport IS NULL;

-- Step 4: Verify the update
SELECT id, name, sport, competition, series_type FROM series;

-- Optional: Add constraints to ensure valid values
-- Uncomment these if you want to enforce valid values at the database level

-- ALTER TABLE series
-- ADD CONSTRAINT check_sport
-- CHECK (sport IN ('nfl', 'soccer'));

-- ALTER TABLE series
-- ADD CONSTRAINT check_competition
-- CHECK (competition IN ('regular_season', 'playoffs', 'premier_league', 'world_cup_2026'));

-- ALTER TABLE series
-- ADD CONSTRAINT check_series_type
-- CHECK (series_type IN ('survivor', 'playoff_pool', 'last_man_standing'));
