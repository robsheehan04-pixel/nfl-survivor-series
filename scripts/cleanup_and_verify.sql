-- CLEANUP AND VERIFY SCRIPT
-- Run this in Supabase SQL Editor

-- =============================================
-- STEP 1: Check current state of picks for the main series
-- =============================================
SELECT
  u.name as player_name,
  p.week,
  p.team_id,
  p.result
FROM picks p
JOIN users u ON p.user_id = u.id
WHERE p.series_id = 'f2953e70-5868-4944-898f-a0fdfd5b8044'
ORDER BY u.name, p.week
LIMIT 50;

-- =============================================
-- STEP 2: Check lives and elimination status
-- =============================================
SELECT
  u.name as player_name,
  sm.lives_remaining,
  sm.is_eliminated
FROM series_members sm
JOIN users u ON sm.user_id = u.id
WHERE sm.series_id = 'f2953e70-5868-4944-898f-a0fdfd5b8044'
ORDER BY sm.is_eliminated, sm.lives_remaining DESC;

-- =============================================
-- STEP 3: List all series (to see which to delete)
-- =============================================
SELECT
  id,
  name,
  current_week,
  created_at
FROM series
ORDER BY created_at DESC;

-- =============================================
-- STEP 4: DELETE UNWANTED SERIES
-- Uncomment and modify the IDs you want to delete
-- =============================================

-- Delete picks for unwanted series
-- DELETE FROM picks WHERE series_id IN (
--   '01fabff9-15b6-4bf3-89ec-85c4730279d5',  -- Test
--   '2c4413c1-b097-4a4f-8664-e0d8a6c1df16',  -- Lynchys Survivor Series (Week 1)
--   '4e103aec-42d1-4e2c-b818-263e9f1ac4a9',  -- Lynchys Survivor Series (Week 1)
--   '30980dfc-06ef-41f5-85d4-df319029456c',  -- Lynchys Survivor Series (Week 1)
--   '70893f0c-4c4f-46bb-8b26-acc81442a951',  -- Test Series
--   '9c4e8597-760c-4e59-af04-1d201940ddb3',  -- Test Series
--   'c73fefc1-a8f3-40a6-857f-95555660e4ee',  -- Test Series
--   '88a8e602-6468-4d9e-ad6d-4a3a95ac2202',  -- Test Series
--   'ed817618-ae89-4e3b-9d7f-dffaeca25d71',  -- Test Survivor Series (Week 1)
--   '146b4a70-ae99-486a-b935-194ee4d501bc'   -- Test Survivor Series (Week 13) - duplicate?
-- );

-- Delete invitations for unwanted series
-- DELETE FROM invitations WHERE series_id IN (
--   '01fabff9-15b6-4bf3-89ec-85c4730279d5',
--   '2c4413c1-b097-4a4f-8664-e0d8a6c1df16',
--   '4e103aec-42d1-4e2c-b818-263e9f1ac4a9',
--   '30980dfc-06ef-41f5-85d4-df319029456c',
--   '70893f0c-4c4f-46bb-8b26-acc81442a951',
--   '9c4e8597-760c-4e59-af04-1d201940ddb3',
--   'c73fefc1-a8f3-40a6-857f-95555660e4ee',
--   '88a8e602-6468-4d9e-ad6d-4a3a95ac2202',
--   'ed817618-ae89-4e3b-9d7f-dffaeca25d71',
--   '146b4a70-ae99-486a-b935-194ee4d501bc'
-- );

-- Delete series_members for unwanted series
-- DELETE FROM series_members WHERE series_id IN (
--   '01fabff9-15b6-4bf3-89ec-85c4730279d5',
--   '2c4413c1-b097-4a4f-8664-e0d8a6c1df16',
--   '4e103aec-42d1-4e2c-b818-263e9f1ac4a9',
--   '30980dfc-06ef-41f5-85d4-df319029456c',
--   '70893f0c-4c4f-46bb-8b26-acc81442a951',
--   '9c4e8597-760c-4e59-af04-1d201940ddb3',
--   'c73fefc1-a8f3-40a6-857f-95555660e4ee',
--   '88a8e602-6468-4d9e-ad6d-4a3a95ac2202',
--   'ed817618-ae89-4e3b-9d7f-dffaeca25d71',
--   '146b4a70-ae99-486a-b935-194ee4d501bc'
-- );

-- Delete the series themselves
-- DELETE FROM series WHERE id IN (
--   '01fabff9-15b6-4bf3-89ec-85c4730279d5',
--   '2c4413c1-b097-4a4f-8664-e0d8a6c1df16',
--   '4e103aec-42d1-4e2c-b818-263e9f1ac4a9',
--   '30980dfc-06ef-41f5-85d4-df319029456c',
--   '70893f0c-4c4f-46bb-8b26-acc81442a951',
--   '9c4e8597-760c-4e59-af04-1d201940ddb3',
--   'c73fefc1-a8f3-40a6-857f-95555660e4ee',
--   '88a8e602-6468-4d9e-ad6d-4a3a95ac2202',
--   'ed817618-ae89-4e3b-9d7f-dffaeca25d71',
--   '146b4a70-ae99-486a-b935-194ee4d501bc'
-- );
