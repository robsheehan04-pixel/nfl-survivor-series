-- Remove one life from Niall Skelton
UPDATE series_members
SET lives_remaining = lives_remaining - 1
WHERE series_id = 'f2953e70-5868-4944-898f-a0fdfd5b8044'
AND user_id = '61de2936-d976-443d-bd7d-5622f4d4e733';

-- Verify the update
SELECT u.name, sm.lives_remaining, sm.is_eliminated
FROM series_members sm
JOIN users u ON sm.user_id = u.id
WHERE sm.series_id = 'f2953e70-5868-4944-898f-a0fdfd5b8044'
AND u.name = 'Niall Skelton';
