-- DELETE ALL SERIES EXCEPT f2953e70-5868-4944-898f-a0fdfd5b8044
-- Run this in Supabase SQL Editor

-- Step 1: Delete picks for unwanted series
DELETE FROM picks WHERE series_id != 'f2953e70-5868-4944-898f-a0fdfd5b8044';

-- Step 2: Delete invitations for unwanted series
DELETE FROM invitations WHERE series_id != 'f2953e70-5868-4944-898f-a0fdfd5b8044';

-- Step 3: Delete series_members for unwanted series
DELETE FROM series_members WHERE series_id != 'f2953e70-5868-4944-898f-a0fdfd5b8044';

-- Step 4: Delete the series themselves
DELETE FROM series WHERE id != 'f2953e70-5868-4944-898f-a0fdfd5b8044';

-- Verify only one series remains
SELECT id, name, current_week FROM series;
