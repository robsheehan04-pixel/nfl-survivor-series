-- NFL Survivor Series - Seed Picks Script
-- Run this in your Supabase SQL Editor
-- Make sure to replace 'YOUR_SERIES_ID' with the actual series ID from your database

-- ==========================================
-- STEP 1: First, get your series ID
-- Run this query first to find your series:
-- SELECT id, name FROM series;
-- Then replace 'YOUR_SERIES_ID' below with the actual ID
-- ==========================================

-- Set the series ID variable (replace with your actual series ID)
-- Example: 'abc123-def456-ghi789'

-- ==========================================
-- STEP 2: Create dummy users for new participants
-- ==========================================

-- Insert new users (these will get auto-generated UUIDs)
INSERT INTO users (email, name, picture) VALUES
  ('ciaran.lynch@survivor.local', 'Ciarán Lynch', NULL),
  ('pa.coakley@survivor.local', 'Pa Coakley', NULL),
  ('chris.king@survivor.local', 'Chris King', NULL),
  ('cathal.duggan@survivor.local', 'Cathal Duggan', NULL),
  ('ron.doyle@survivor.local', 'Ron Doyle', NULL),
  ('jeff.malenfant@survivor.local', 'Jeff Malenfant', NULL),
  ('dan.hickey@survivor.local', 'Dan Hickey', NULL),
  ('cormac.lynch@survivor.local', 'Cormac Lynch', NULL),
  ('damien.byrne@survivor.local', 'Damien Byrne', NULL),
  ('rory.goldsmith@survivor.local', 'Rory Goldsmith', NULL),
  ('niall.mcdonagh@survivor.local', 'Niall McDonagh', NULL),
  ('niall.skelton@survivor.local', 'Niall Skelton', NULL)
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- STEP 3: Add all users as series members
-- Replace 'YOUR_SERIES_ID' with your actual series ID
-- ==========================================

-- First, let's create a function to add members and picks
-- This makes it easier to handle the series_id

DO $$
DECLARE
  v_series_id UUID;
  v_ciaran_id UUID;
  v_pa_id UUID;
  v_chris_id UUID;
  v_cathal_id UUID;
  v_kevin_id UUID;
  v_ron_id UUID;
  v_jeff_id UUID;
  v_dan_id UUID;
  v_cormac_id UUID;
  v_damien_id UUID;
  v_frank_id UUID;
  v_rory_id UUID;
  v_niall_m_id UUID;
  v_niall_s_id UUID;
BEGIN
  -- Get the series ID (assuming there's only one series, or get the first one)
  -- If you have multiple series, modify this to select the correct one by name
  SELECT id INTO v_series_id FROM series LIMIT 1;

  IF v_series_id IS NULL THEN
    RAISE EXCEPTION 'No series found! Create a series first.';
  END IF;

  RAISE NOTICE 'Using series ID: %', v_series_id;

  -- Get user IDs
  SELECT id INTO v_ciaran_id FROM users WHERE email = 'ciaran.lynch@survivor.local';
  SELECT id INTO v_pa_id FROM users WHERE email = 'pa.coakley@survivor.local';
  SELECT id INTO v_chris_id FROM users WHERE email = 'chris.king@survivor.local';
  SELECT id INTO v_cathal_id FROM users WHERE email = 'cathal.duggan@survivor.local';
  SELECT id INTO v_kevin_id FROM users WHERE email ILIKE '%kevin%' OR name ILIKE '%kevin%' LIMIT 1;
  SELECT id INTO v_ron_id FROM users WHERE email = 'ron.doyle@survivor.local';
  SELECT id INTO v_jeff_id FROM users WHERE email = 'jeff.malenfant@survivor.local';
  SELECT id INTO v_dan_id FROM users WHERE email = 'dan.hickey@survivor.local';
  SELECT id INTO v_cormac_id FROM users WHERE email = 'cormac.lynch@survivor.local';
  SELECT id INTO v_damien_id FROM users WHERE email = 'damien.byrne@survivor.local';
  SELECT id INTO v_frank_id FROM users WHERE email ILIKE '%frank%' OR name ILIKE '%frank%' LIMIT 1;
  SELECT id INTO v_rory_id FROM users WHERE email = 'rory.goldsmith@survivor.local';
  SELECT id INTO v_niall_m_id FROM users WHERE email = 'niall.mcdonagh@survivor.local';
  SELECT id INTO v_niall_s_id FROM users WHERE email = 'niall.skelton@survivor.local';

  -- Add new users as series members (skip existing ones)
  INSERT INTO series_members (series_id, user_id, lives_remaining, is_eliminated)
  SELECT v_series_id, id, 2, false FROM users
  WHERE email IN (
    'ciaran.lynch@survivor.local',
    'pa.coakley@survivor.local',
    'chris.king@survivor.local',
    'cathal.duggan@survivor.local',
    'ron.doyle@survivor.local',
    'jeff.malenfant@survivor.local',
    'dan.hickey@survivor.local',
    'cormac.lynch@survivor.local',
    'damien.byrne@survivor.local',
    'rory.goldsmith@survivor.local',
    'niall.mcdonagh@survivor.local',
    'niall.skelton@survivor.local'
  )
  ON CONFLICT (series_id, user_id) DO NOTHING;

  -- ==========================================
  -- STEP 4: Insert all picks for weeks 1-13
  -- Team IDs are lowercase: phi, dal, tb, den, ari, gb, kc, ind, lac, sea, ne, det, bal, etc.
  -- ==========================================

  -- Delete existing picks for these users to avoid duplicates (optional - comment out if you want to keep existing)
  DELETE FROM picks WHERE series_id = v_series_id AND user_id IN (
    v_ciaran_id, v_pa_id, v_chris_id, v_cathal_id, v_kevin_id, v_ron_id,
    v_jeff_id, v_dan_id, v_cormac_id, v_damien_id, v_frank_id, v_rory_id,
    v_niall_m_id, v_niall_s_id
  );

  -- 1. Ciarán Lynch: PHI, DAL, TB, DEN, ARI, GB, KC, IND, LAC, SEA, NE, DET, BAL
  IF v_ciaran_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_ciaran_id, 1, 'phi', 'win', false),
      (v_series_id, v_ciaran_id, 2, 'dal', 'win', false),
      (v_series_id, v_ciaran_id, 3, 'tb', 'win', false),
      (v_series_id, v_ciaran_id, 4, 'den', 'win', false),
      (v_series_id, v_ciaran_id, 5, 'ari', 'win', false),
      (v_series_id, v_ciaran_id, 6, 'gb', 'win', false),
      (v_series_id, v_ciaran_id, 7, 'kc', 'win', false),
      (v_series_id, v_ciaran_id, 8, 'ind', 'win', false),
      (v_series_id, v_ciaran_id, 9, 'lac', 'win', false),
      (v_series_id, v_ciaran_id, 10, 'sea', 'win', false),
      (v_series_id, v_ciaran_id, 11, 'ne', 'loss', false),
      (v_series_id, v_ciaran_id, 12, 'det', 'win', false),
      (v_series_id, v_ciaran_id, 13, 'bal', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 2. Pa Coakley: ARI, DAL, SEA, HOU, IND, GB, KC, ATL, LAR, DEN, NE, DET, BAL
  IF v_pa_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_pa_id, 1, 'ari', 'win', false),
      (v_series_id, v_pa_id, 2, 'dal', 'win', false),
      (v_series_id, v_pa_id, 3, 'sea', 'win', false),
      (v_series_id, v_pa_id, 4, 'hou', 'win', false),
      (v_series_id, v_pa_id, 5, 'ind', 'win', false),
      (v_series_id, v_pa_id, 6, 'gb', 'win', false),
      (v_series_id, v_pa_id, 7, 'kc', 'win', false),
      (v_series_id, v_pa_id, 8, 'atl', 'win', false),
      (v_series_id, v_pa_id, 9, 'lar', 'win', false),
      (v_series_id, v_pa_id, 10, 'den', 'win', false),
      (v_series_id, v_pa_id, 11, 'ne', 'loss', false),
      (v_series_id, v_pa_id, 12, 'det', 'win', false),
      (v_series_id, v_pa_id, 13, 'bal', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 3. Chris King: TB, BAL, SEA, DET, LAR, GB, KC, PHI, LAC, CHI, DAL, NE, JAC
  IF v_chris_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_chris_id, 1, 'tb', 'win', false),
      (v_series_id, v_chris_id, 2, 'bal', 'win', false),
      (v_series_id, v_chris_id, 3, 'sea', 'win', false),
      (v_series_id, v_chris_id, 4, 'det', 'win', false),
      (v_series_id, v_chris_id, 5, 'lar', 'win', false),
      (v_series_id, v_chris_id, 6, 'gb', 'win', false),
      (v_series_id, v_chris_id, 7, 'kc', 'win', false),
      (v_series_id, v_chris_id, 8, 'phi', 'win', false),
      (v_series_id, v_chris_id, 9, 'lac', 'win', false),
      (v_series_id, v_chris_id, 10, 'chi', 'loss', false),
      (v_series_id, v_chris_id, 11, 'dal', 'loss', false),
      (v_series_id, v_chris_id, 12, 'ne', 'loss', false),
      (v_series_id, v_chris_id, 13, 'jax', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 4. Cathal Duggan: ARI, DAL, SEA, PIT, IND, DEN, KC, CIN, LAR, DET, NE, BAL, LAC
  IF v_cathal_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_cathal_id, 1, 'ari', 'win', false),
      (v_series_id, v_cathal_id, 2, 'dal', 'win', false),
      (v_series_id, v_cathal_id, 3, 'sea', 'win', false),
      (v_series_id, v_cathal_id, 4, 'pit', 'win', false),
      (v_series_id, v_cathal_id, 5, 'ind', 'win', false),
      (v_series_id, v_cathal_id, 6, 'den', 'win', false),
      (v_series_id, v_cathal_id, 7, 'kc', 'win', false),
      (v_series_id, v_cathal_id, 8, 'cin', 'loss', false),
      (v_series_id, v_cathal_id, 9, 'lar', 'win', false),
      (v_series_id, v_cathal_id, 10, 'det', 'win', false),
      (v_series_id, v_cathal_id, 11, 'ne', 'loss', false),
      (v_series_id, v_cathal_id, 12, 'bal', 'win', false),
      (v_series_id, v_cathal_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 5. Kevin O'Driscoll: CIN, BUF, SEA, DET, CAR, IND, KC, TB, LAR, DEN, NE, BAL, LAC
  IF v_kevin_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_kevin_id, 1, 'cin', 'win', false),
      (v_series_id, v_kevin_id, 2, 'buf', 'win', false),
      (v_series_id, v_kevin_id, 3, 'sea', 'win', false),
      (v_series_id, v_kevin_id, 4, 'det', 'win', false),
      (v_series_id, v_kevin_id, 5, 'car', 'loss', false),
      (v_series_id, v_kevin_id, 6, 'ind', 'win', false),
      (v_series_id, v_kevin_id, 7, 'kc', 'win', false),
      (v_series_id, v_kevin_id, 8, 'tb', 'win', false),
      (v_series_id, v_kevin_id, 9, 'lar', 'win', false),
      (v_series_id, v_kevin_id, 10, 'den', 'win', false),
      (v_series_id, v_kevin_id, 11, 'ne', 'loss', false),
      (v_series_id, v_kevin_id, 12, 'bal', 'win', false),
      (v_series_id, v_kevin_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 6. Ron Doyle: PHI, DAL, SEA, BUF, ARI, GB, KC, IND, LAR, DET, NE, BAL, LAC
  IF v_ron_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_ron_id, 1, 'phi', 'win', false),
      (v_series_id, v_ron_id, 2, 'dal', 'win', false),
      (v_series_id, v_ron_id, 3, 'sea', 'win', false),
      (v_series_id, v_ron_id, 4, 'buf', 'win', false),
      (v_series_id, v_ron_id, 5, 'ari', 'win', false),
      (v_series_id, v_ron_id, 6, 'gb', 'win', false),
      (v_series_id, v_ron_id, 7, 'kc', 'win', false),
      (v_series_id, v_ron_id, 8, 'ind', 'win', false),
      (v_series_id, v_ron_id, 9, 'lar', 'win', false),
      (v_series_id, v_ron_id, 10, 'det', 'win', false),
      (v_series_id, v_ron_id, 11, 'ne', 'loss', false),
      (v_series_id, v_ron_id, 12, 'bal', 'win', false),
      (v_series_id, v_ron_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 7. Jeff Malenfant: ARI, DAL, GB, BUF, IND, DEN, NE, KC, LAR, SEA, BAL, DET, LAC
  IF v_jeff_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_jeff_id, 1, 'ari', 'win', false),
      (v_series_id, v_jeff_id, 2, 'dal', 'win', false),
      (v_series_id, v_jeff_id, 3, 'gb', 'win', false),
      (v_series_id, v_jeff_id, 4, 'buf', 'win', false),
      (v_series_id, v_jeff_id, 5, 'ind', 'win', false),
      (v_series_id, v_jeff_id, 6, 'den', 'win', false),
      (v_series_id, v_jeff_id, 7, 'ne', 'loss', false),
      (v_series_id, v_jeff_id, 8, 'kc', 'win', false),
      (v_series_id, v_jeff_id, 9, 'lar', 'win', false),
      (v_series_id, v_jeff_id, 10, 'sea', 'win', false),
      (v_series_id, v_jeff_id, 11, 'bal', 'win', false),
      (v_series_id, v_jeff_id, 12, 'det', 'win', false),
      (v_series_id, v_jeff_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 8. Dan Hickey: WAS, ARI, BUF, DEN, DET, GB, NE, PHI, LAR, CAR, BAL, SEA, LAC
  IF v_dan_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_dan_id, 1, 'was', 'win', false),
      (v_series_id, v_dan_id, 2, 'ari', 'win', false),
      (v_series_id, v_dan_id, 3, 'buf', 'win', false),
      (v_series_id, v_dan_id, 4, 'den', 'win', false),
      (v_series_id, v_dan_id, 5, 'det', 'win', false),
      (v_series_id, v_dan_id, 6, 'gb', 'win', false),
      (v_series_id, v_dan_id, 7, 'ne', 'loss', false),
      (v_series_id, v_dan_id, 8, 'phi', 'win', false),
      (v_series_id, v_dan_id, 9, 'lar', 'win', false),
      (v_series_id, v_dan_id, 10, 'car', 'loss', false),
      (v_series_id, v_dan_id, 11, 'bal', 'win', false),
      (v_series_id, v_dan_id, 12, 'sea', 'win', false),
      (v_series_id, v_dan_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 9. Cormac Lynch: PHI, DAL, TB, BUF, MIN, GB, PIT, BAL, LAR, DET, NE, SEA, LAC
  IF v_cormac_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_cormac_id, 1, 'phi', 'win', false),
      (v_series_id, v_cormac_id, 2, 'dal', 'win', false),
      (v_series_id, v_cormac_id, 3, 'tb', 'win', false),
      (v_series_id, v_cormac_id, 4, 'buf', 'win', false),
      (v_series_id, v_cormac_id, 5, 'min', 'win', false),
      (v_series_id, v_cormac_id, 6, 'gb', 'win', false),
      (v_series_id, v_cormac_id, 7, 'pit', 'win', false),
      (v_series_id, v_cormac_id, 8, 'bal', 'win', false),
      (v_series_id, v_cormac_id, 9, 'lar', 'win', false),
      (v_series_id, v_cormac_id, 10, 'det', 'win', false),
      (v_series_id, v_cormac_id, 11, 'ne', 'loss', false),
      (v_series_id, v_cormac_id, 12, 'sea', 'win', false),
      (v_series_id, v_cormac_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 10. Damien Byrne: PHI, BAL, BUF, DET, LAR, GB, KC, IND, NE, DEN, PIT, SEA, LAC
  IF v_damien_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_damien_id, 1, 'phi', 'win', false),
      (v_series_id, v_damien_id, 2, 'bal', 'win', false),
      (v_series_id, v_damien_id, 3, 'buf', 'win', false),
      (v_series_id, v_damien_id, 4, 'det', 'win', false),
      (v_series_id, v_damien_id, 5, 'lar', 'win', false),
      (v_series_id, v_damien_id, 6, 'gb', 'win', false),
      (v_series_id, v_damien_id, 7, 'kc', 'win', false),
      (v_series_id, v_damien_id, 8, 'ind', 'win', false),
      (v_series_id, v_damien_id, 9, 'ne', 'loss', false),
      (v_series_id, v_damien_id, 10, 'den', 'win', false),
      (v_series_id, v_damien_id, 11, 'pit', 'win', false),
      (v_series_id, v_damien_id, 12, 'sea', 'win', false),
      (v_series_id, v_damien_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 11. Frank Scannell: DEN, BAL, BUF, DET, ARI, GB, KC, IND, LAR, SEA, NE, SF, LAC
  IF v_frank_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_frank_id, 1, 'den', 'win', false),
      (v_series_id, v_frank_id, 2, 'bal', 'win', false),
      (v_series_id, v_frank_id, 3, 'buf', 'win', false),
      (v_series_id, v_frank_id, 4, 'det', 'win', false),
      (v_series_id, v_frank_id, 5, 'ari', 'win', false),
      (v_series_id, v_frank_id, 6, 'gb', 'win', false),
      (v_series_id, v_frank_id, 7, 'kc', 'win', false),
      (v_series_id, v_frank_id, 8, 'ind', 'win', false),
      (v_series_id, v_frank_id, 9, 'lar', 'win', false),
      (v_series_id, v_frank_id, 10, 'sea', 'win', false),
      (v_series_id, v_frank_id, 11, 'ne', 'loss', false),
      (v_series_id, v_frank_id, 12, 'sf', 'loss', false),
      (v_series_id, v_frank_id, 13, 'lac', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 12. Rory Goldsmith: WAS, BAL, TB, PIT, IND, DEN, SEA, KC, LAR, BUF, NE, DET, MIA
  IF v_rory_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_rory_id, 1, 'was', 'win', false),
      (v_series_id, v_rory_id, 2, 'bal', 'win', false),
      (v_series_id, v_rory_id, 3, 'tb', 'win', false),
      (v_series_id, v_rory_id, 4, 'pit', 'win', false),
      (v_series_id, v_rory_id, 5, 'ind', 'win', false),
      (v_series_id, v_rory_id, 6, 'den', 'win', false),
      (v_series_id, v_rory_id, 7, 'sea', 'win', false),
      (v_series_id, v_rory_id, 8, 'kc', 'win', false),
      (v_series_id, v_rory_id, 9, 'lar', 'win', false),
      (v_series_id, v_rory_id, 10, 'buf', 'win', false),
      (v_series_id, v_rory_id, 11, 'ne', 'loss', false),
      (v_series_id, v_rory_id, 12, 'det', 'win', false),
      (v_series_id, v_rory_id, 13, 'mia', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 13. Niall McDonagh: DEN, ARI, TB, LAC, DET, GB, KC, IND, LAR, CHI, HOU, BAL, SEA
  IF v_niall_m_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_niall_m_id, 1, 'den', 'win', false),
      (v_series_id, v_niall_m_id, 2, 'ari', 'win', false),
      (v_series_id, v_niall_m_id, 3, 'tb', 'win', false),
      (v_series_id, v_niall_m_id, 4, 'lac', 'win', false),
      (v_series_id, v_niall_m_id, 5, 'det', 'win', false),
      (v_series_id, v_niall_m_id, 6, 'gb', 'win', false),
      (v_series_id, v_niall_m_id, 7, 'kc', 'win', false),
      (v_series_id, v_niall_m_id, 8, 'ind', 'win', false),
      (v_series_id, v_niall_m_id, 9, 'lar', 'win', false),
      (v_series_id, v_niall_m_id, 10, 'chi', 'loss', false),
      (v_series_id, v_niall_m_id, 11, 'hou', 'win', false),
      (v_series_id, v_niall_m_id, 12, 'bal', 'win', false),
      (v_series_id, v_niall_m_id, 13, 'sea', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- 14. Niall Skelton: ARI, BAL, BUF, DET, IND, PIT, KC, PHI, LAR, DEN, NE, GB, SEA
  IF v_niall_s_id IS NOT NULL THEN
    INSERT INTO picks (series_id, user_id, week, team_id, result, is_auto_pick) VALUES
      (v_series_id, v_niall_s_id, 1, 'ari', 'win', false),
      (v_series_id, v_niall_s_id, 2, 'bal', 'win', false),
      (v_series_id, v_niall_s_id, 3, 'buf', 'win', false),
      (v_series_id, v_niall_s_id, 4, 'det', 'win', false),
      (v_series_id, v_niall_s_id, 5, 'ind', 'win', false),
      (v_series_id, v_niall_s_id, 6, 'pit', 'loss', false),
      (v_series_id, v_niall_s_id, 7, 'kc', 'win', false),
      (v_series_id, v_niall_s_id, 8, 'phi', 'win', false),
      (v_series_id, v_niall_s_id, 9, 'lar', 'win', false),
      (v_series_id, v_niall_s_id, 10, 'den', 'win', false),
      (v_series_id, v_niall_s_id, 11, 'ne', 'loss', false),
      (v_series_id, v_niall_s_id, 12, 'gb', 'win', false),
      (v_series_id, v_niall_s_id, 13, 'sea', 'pending', false)
    ON CONFLICT (series_id, user_id, week) DO UPDATE SET team_id = EXCLUDED.team_id, result = EXCLUDED.result;
  END IF;

  -- Update the series current week to 13
  UPDATE series SET current_week = 13 WHERE id = v_series_id;

  RAISE NOTICE 'Successfully added all picks!';
END $$;

-- ==========================================
-- STEP 5: Verify the data
-- ==========================================

-- Check users
SELECT id, name, email FROM users ORDER BY name;

-- Check series members
SELECT sm.*, u.name
FROM series_members sm
JOIN users u ON sm.user_id = u.id
ORDER BY u.name;

-- Check picks count per user
SELECT u.name, COUNT(p.id) as pick_count
FROM users u
LEFT JOIN picks p ON u.id = p.user_id
GROUP BY u.id, u.name
ORDER BY u.name;

-- View all picks with team names
SELECT u.name as player, p.week, p.team_id, p.result
FROM picks p
JOIN users u ON p.user_id = u.id
ORDER BY u.name, p.week;
