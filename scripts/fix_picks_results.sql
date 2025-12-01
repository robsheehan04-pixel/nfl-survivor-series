-- NFL Survivor Series - Fix Pick Results for 2025 Season
-- Run this in Supabase SQL Editor to correct all win/loss results
-- Based on actual NFL 2025 season results (Weeks 1-13)

-- This script updates all picks with the correct results based on 2025 NFL game outcomes

DO $$
DECLARE
  v_series_id UUID;
BEGIN
  -- Get the series ID
  SELECT id INTO v_series_id FROM series LIMIT 1;

  IF v_series_id IS NULL THEN
    RAISE EXCEPTION 'No series found!';
  END IF;

  RAISE NOTICE 'Updating picks for series ID: %', v_series_id;

  -- ==========================================
  -- WEEK 1 RESULTS (2025)
  -- Winners: ARI, BUF, CIN, DEN, IND, JAX, LAC, LAR, MIN, PHI, PIT, SF, TB, WAS, GB, LV
  -- Losers: ATL, BAL, CAR, CHI, CLE, DAL, DET, HOU, KC, MIA, NE, NO, NYG, NYJ, SEA, TEN
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 1 AND team_id IN ('ari', 'buf', 'cin', 'den', 'ind', 'jax', 'lac', 'lar', 'min', 'phi', 'pit', 'sf', 'tb', 'was', 'gb', 'lv');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 1 AND team_id IN ('atl', 'bal', 'car', 'chi', 'cle', 'dal', 'det', 'hou', 'kc', 'mia', 'ne', 'no', 'nyg', 'nyj', 'sea', 'ten');

  -- ==========================================
  -- WEEK 2 RESULTS (2025)
  -- Winners: ARI, BAL, BUF, CIN, DAL, DET, GB, IND, LAC, LAR, NE, PHI, SEA, SF, TB
  -- Losers: ATL, CAR, CHI, CLE, DEN, HOU, JAX, KC, MIA, MIN, NO, NYG, NYJ, TEN, WAS, LV, PIT
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 2 AND team_id IN ('ari', 'bal', 'buf', 'cin', 'dal', 'det', 'gb', 'ind', 'lac', 'lar', 'ne', 'phi', 'sea', 'sf', 'tb');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 2 AND team_id IN ('atl', 'car', 'chi', 'cle', 'den', 'hou', 'jax', 'kc', 'mia', 'min', 'no', 'nyg', 'nyj', 'ten', 'was', 'lv', 'pit');

  -- ==========================================
  -- WEEK 3 RESULTS (2025)
  -- Winners: BUF, CAR, CLE, DET, IND, JAX, KC, LAC, MIN, PHI, PIT, SEA, SF, TB, WAS
  -- Losers: ATL, CHI, CIN, DAL, GB, HOU, LAR, LV, MIA, NE, NO, NYG, NYJ, TEN, ARI, BAL
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 3 AND team_id IN ('buf', 'car', 'cle', 'det', 'ind', 'jax', 'kc', 'lac', 'min', 'phi', 'pit', 'sea', 'sf', 'tb', 'was');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 3 AND team_id IN ('atl', 'chi', 'cin', 'dal', 'gb', 'hou', 'lar', 'lv', 'mia', 'ne', 'no', 'nyg', 'nyj', 'ten', 'ari', 'bal');

  -- ==========================================
  -- WEEK 4 RESULTS (2025)
  -- Winners: ATL, BUF, CHI, DEN, DET, HOU, JAX, KC, LAR, MIA, NE, NYG, PHI, PIT, SEA
  -- Losers: ARI, CAR, CIN, CLE, IND, MIN, NO, NYJ, TB, TEN, WAS, BAL, LV, LAC, SF
  -- Tie: DAL, GB (counts as win by default settings)
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 4 AND team_id IN ('atl', 'buf', 'chi', 'den', 'det', 'hou', 'jax', 'kc', 'lar', 'mia', 'ne', 'nyg', 'phi', 'pit', 'sea', 'dal', 'gb');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 4 AND team_id IN ('ari', 'car', 'cin', 'cle', 'ind', 'min', 'no', 'nyj', 'tb', 'ten', 'was', 'bal', 'lv', 'lac', 'sf');

  -- ==========================================
  -- WEEK 5 RESULTS (2025)
  -- Winners: CAR, DAL, DEN, DET, HOU, IND, JAX, MIN, NE, NO, TB, TEN, WAS, SF
  -- Losers: ARI, ATL, BAL, BUF, CHI, CIN, CLE, GB, KC, LAC, LAR, MIA, NYG, NYJ, PIT, SEA, PHI
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 5 AND team_id IN ('car', 'dal', 'den', 'det', 'hou', 'ind', 'jax', 'min', 'ne', 'no', 'tb', 'ten', 'was', 'sf');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 5 AND team_id IN ('ari', 'atl', 'bal', 'buf', 'chi', 'cin', 'cle', 'gb', 'kc', 'lac', 'lar', 'mia', 'nyg', 'nyj', 'pit', 'sea', 'phi');

  -- ==========================================
  -- WEEK 6 RESULTS (2025)
  -- Winners: ATL, CHI, DEN, GB, IND, KC, LAC, LAR, NE, NYG, LV, CAR, PIT, SEA, TB
  -- Losers: ARI, BAL, BUF, CIN, CLE, DAL, DET, HOU, JAX, MIN, MIA, NO, NYJ, PHI, SF, TEN, WAS
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 6 AND team_id IN ('atl', 'chi', 'den', 'gb', 'ind', 'kc', 'lac', 'lar', 'ne', 'nyg', 'lv', 'car', 'pit', 'sea', 'tb');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 6 AND team_id IN ('ari', 'bal', 'buf', 'cin', 'cle', 'dal', 'det', 'hou', 'jax', 'min', 'mia', 'no', 'nyj', 'phi', 'sf', 'ten', 'was');

  -- ==========================================
  -- WEEK 7 RESULTS (2025)
  -- Winners: CHI, CIN, CLE, DAL, DEN, GB, IND, KC, LAR, NE, PHI, CAR, SF, DET, SEA
  -- Losers: ARI, ATL, BAL, BUF, HOU, JAX, LAC, LV, MIA, MIN, NO, NYG, NYJ, PIT, TB, TEN, WAS
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 7 AND team_id IN ('chi', 'cin', 'cle', 'dal', 'den', 'gb', 'ind', 'kc', 'lar', 'ne', 'phi', 'car', 'sf', 'det', 'sea');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 7 AND team_id IN ('ari', 'atl', 'bal', 'buf', 'hou', 'jax', 'lac', 'lv', 'mia', 'min', 'no', 'nyg', 'nyj', 'pit', 'tb', 'ten', 'was');

  -- ==========================================
  -- WEEK 8 RESULTS (2025)
  -- Winners: BAL, BUF, DEN, GB, HOU, IND, KC, LAC, MIA, NE, NYJ, PHI, TB
  -- Losers: ATL, CAR, CHI, CIN, CLE, DAL, MIN, NO, NYG, PIT, SF, TEN, WAS, ARI, DET, JAX, LV, LAR, SEA
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 8 AND team_id IN ('bal', 'buf', 'den', 'gb', 'hou', 'ind', 'kc', 'lac', 'mia', 'ne', 'nyj', 'phi', 'tb');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 8 AND team_id IN ('atl', 'car', 'chi', 'cin', 'cle', 'dal', 'min', 'no', 'nyg', 'pit', 'sf', 'ten', 'was', 'ari', 'det', 'jax', 'lv', 'lar', 'sea');

  -- ==========================================
  -- WEEK 9 RESULTS (2025)
  -- Winners: ARI, BAL, BUF, CAR, CHI, DEN, JAX, LAC, LAR, MIN, NE, PIT, SEA, SF
  -- Losers: ATL, CIN, CLE, DAL, DET, GB, HOU, IND, KC, LV, MIA, NO, NYG, NYJ, TB, TEN, WAS, PHI
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 9 AND team_id IN ('ari', 'bal', 'buf', 'car', 'chi', 'den', 'jax', 'lac', 'lar', 'min', 'ne', 'pit', 'sea', 'sf');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 9 AND team_id IN ('atl', 'cin', 'cle', 'dal', 'det', 'gb', 'hou', 'ind', 'kc', 'lv', 'mia', 'no', 'nyg', 'nyj', 'tb', 'ten', 'was', 'phi');

  -- ==========================================
  -- WEEK 10 RESULTS (2025)
  -- Winners: BAL, CHI, DEN, DET, HOU, IND, LAC, LAR, MIA, NE, NO, NYJ, PHI, SEA
  -- Losers: ARI, ATL, BUF, CAR, CIN, CLE, GB, JAX, KC, LV, MIN, NYG, PIT, SF, TB, TEN, WAS
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 10 AND team_id IN ('bal', 'chi', 'den', 'det', 'hou', 'ind', 'lac', 'lar', 'mia', 'ne', 'no', 'nyj', 'phi', 'sea');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 10 AND team_id IN ('ari', 'atl', 'buf', 'car', 'cin', 'cle', 'gb', 'jax', 'kc', 'lv', 'min', 'nyg', 'pit', 'sf', 'tb', 'ten', 'was');

  -- ==========================================
  -- WEEK 11 RESULTS (2025)
  -- Winners: BAL, BUF, CHI, DAL, DEN, GB, HOU, JAX, LAR, MIA, NE, CAR, PHI, PIT, SF
  -- Losers: ARI, ATL, CIN, CLE, DET, IND, KC, LAC, LV, MIN, NO, NYG, NYJ, SEA, TB, TEN, WAS
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 11 AND team_id IN ('bal', 'buf', 'chi', 'dal', 'den', 'gb', 'hou', 'jax', 'lar', 'mia', 'ne', 'car', 'phi', 'pit', 'sf');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 11 AND team_id IN ('ari', 'atl', 'cin', 'cle', 'det', 'ind', 'kc', 'lac', 'lv', 'min', 'no', 'nyg', 'nyj', 'sea', 'tb', 'ten', 'was');

  -- ==========================================
  -- WEEK 12 RESULTS (2025)
  -- Winners: ATL, BAL, CHI, CLE, DAL, DET, GB, HOU, JAX, KC, LAR, NE, SEA, SF
  -- Losers: ARI, BUF, CAR, CIN, DEN, IND, LAC, LV, MIA, MIN, NO, NYG, NYJ, PHI, PIT, TB, TEN, WAS
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 12 AND team_id IN ('atl', 'bal', 'chi', 'cle', 'dal', 'det', 'gb', 'hou', 'jax', 'kc', 'lar', 'ne', 'sea', 'sf');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 12 AND team_id IN ('ari', 'buf', 'car', 'cin', 'den', 'ind', 'lac', 'lv', 'mia', 'min', 'no', 'nyg', 'nyj', 'phi', 'pit', 'tb', 'ten', 'was');

  -- ==========================================
  -- WEEK 13 RESULTS (2025) - As of Nov 30
  -- Winners: BUF, CAR, CHI, CIN, DAL, DEN, GB, HOU, JAX, LAC, MIA, NYJ, SEA, SF, TB
  -- Losers: ARI, ATL, BAL, CLE, DET, IND, KC, LAR, LV, MIN, NO, PIT, TEN, WAS
  -- Monday game (NYG vs NE) still pending
  -- ==========================================
  UPDATE picks SET result = 'win' WHERE series_id = v_series_id AND week = 13 AND team_id IN ('buf', 'car', 'chi', 'cin', 'dal', 'den', 'gb', 'hou', 'jax', 'lac', 'mia', 'nyj', 'sea', 'sf', 'tb');
  UPDATE picks SET result = 'loss' WHERE series_id = v_series_id AND week = 13 AND team_id IN ('ari', 'atl', 'bal', 'cle', 'det', 'ind', 'kc', 'lar', 'lv', 'min', 'no', 'pit', 'ten', 'was');
  -- Keep NYG and NE as pending for Monday night game
  UPDATE picks SET result = 'pending' WHERE series_id = v_series_id AND week = 13 AND team_id IN ('nyg', 'ne');

  RAISE NOTICE 'Pick results updated successfully!';

END $$;

-- Now update lives_remaining and is_eliminated based on losses
DO $$
DECLARE
  v_series_id UUID;
  v_lives_per_player INT := 2;
BEGIN
  SELECT id INTO v_series_id FROM series LIMIT 1;

  -- Update lives_remaining based on loss count
  UPDATE series_members sm
  SET
    lives_remaining = GREATEST(0, v_lives_per_player - COALESCE(loss_count.losses, 0)),
    is_eliminated = (v_lives_per_player - COALESCE(loss_count.losses, 0)) <= 0
  FROM (
    SELECT
      user_id,
      COUNT(*) FILTER (WHERE result = 'loss') as losses
    FROM picks
    WHERE series_id = v_series_id
    GROUP BY user_id
  ) loss_count
  WHERE sm.series_id = v_series_id
    AND sm.user_id = loss_count.user_id;

  RAISE NOTICE 'Lives and elimination status updated!';

END $$;

-- Show the final results
SELECT
  u.name,
  sm.lives_remaining,
  sm.is_eliminated,
  COUNT(*) FILTER (WHERE p.result = 'win') as wins,
  COUNT(*) FILTER (WHERE p.result = 'loss') as losses,
  COUNT(*) FILTER (WHERE p.result = 'pending') as pending
FROM series_members sm
JOIN users u ON sm.user_id = u.id
LEFT JOIN picks p ON p.user_id = sm.user_id AND p.series_id = sm.series_id
WHERE sm.series_id = (SELECT id FROM series LIMIT 1)
GROUP BY u.name, sm.lives_remaining, sm.is_eliminated
ORDER BY sm.is_eliminated, sm.lives_remaining DESC, wins DESC;
