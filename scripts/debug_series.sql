-- Debug script to check ALL series in the database
-- Run this in Supabase SQL Editor

-- 1. List ALL series in the database
SELECT
  id,
  name,
  current_week,
  is_active,
  created_at
FROM series
ORDER BY created_at DESC;

-- 2. Count members per series
SELECT
  s.id,
  s.name,
  s.current_week,
  COUNT(sm.id) as member_count
FROM series s
LEFT JOIN series_members sm ON s.id = sm.series_id
GROUP BY s.id, s.name, s.current_week
ORDER BY s.created_at DESC;

-- 3. Check if owner email user exists and their memberships
SELECT
  u.id,
  u.email,
  u.name,
  s.name as series_name,
  sm.role
FROM users u
LEFT JOIN series_members sm ON u.id = sm.user_id
LEFT JOIN series s ON sm.series_id = s.id
WHERE u.email = 'robsheehan04@gmail.com';
