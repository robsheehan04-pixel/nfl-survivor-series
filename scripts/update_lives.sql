-- NFL Survivor Series - Update Lives Based on Losses
-- Run this AFTER running seed_picks.sql to update lives_remaining and is_eliminated
-- based on actual pick results

-- This script calculates losses for each member and updates their lives accordingly
-- Players start with 2 lives and lose 1 life per loss
-- Players with 0 or fewer lives are marked as eliminated

DO $$
DECLARE
  v_series_id UUID;
  v_lives_per_player INT := 2; -- Default lives per player (adjust if your series uses different)
BEGIN
  -- Get the series ID (modify if you have multiple series)
  SELECT id INTO v_series_id FROM series LIMIT 1;

  IF v_series_id IS NULL THEN
    RAISE EXCEPTION 'No series found!';
  END IF;

  RAISE NOTICE 'Updating lives for series ID: %', v_series_id;

  -- Update lives_remaining based on loss count
  UPDATE series_members sm
  SET
    lives_remaining = GREATEST(0, v_lives_per_player - loss_count.losses),
    is_eliminated = (v_lives_per_player - loss_count.losses) <= 0
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

  -- Log the results
  RAISE NOTICE 'Updated member lives:';

END $$;

-- Show the results after update
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
