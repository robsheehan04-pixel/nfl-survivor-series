-- Debug script to check what's in the database
-- Run this in Supabase SQL Editor to see current state

-- 1. Check all picks with their results
SELECT 
  u.name as player_name,
  p.week,
  p.team_id,
  p.result
FROM picks p
JOIN users u ON p.user_id = u.id
WHERE p.series_id = (SELECT id FROM series LIMIT 1)
ORDER BY u.name, p.week;

-- 2. Check series_members lives and elimination status
SELECT 
  u.name as player_name,
  sm.lives_remaining,
  sm.is_eliminated
FROM series_members sm
JOIN users u ON sm.user_id = u.id
WHERE sm.series_id = (SELECT id FROM series LIMIT 1)
ORDER BY sm.is_eliminated, sm.lives_remaining DESC;

-- 3. Count results per player
SELECT 
  u.name as player_name,
  COUNT(*) FILTER (WHERE p.result = 'win') as wins,
  COUNT(*) FILTER (WHERE p.result = 'loss') as losses,
  COUNT(*) FILTER (WHERE p.result = 'pending') as pending
FROM picks p
JOIN users u ON p.user_id = u.id
WHERE p.series_id = (SELECT id FROM series LIMIT 1)
GROUP BY u.name
ORDER BY u.name;

-- 4. Check a sample of team_ids to verify format
SELECT DISTINCT team_id FROM picks WHERE series_id = (SELECT id FROM series LIMIT 1) ORDER BY team_id;
