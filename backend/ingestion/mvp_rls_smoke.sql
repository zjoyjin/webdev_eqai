-- =============================================================================
-- EQAI MVP RLS smoke test
--
-- Verifies user-owned scale attempts without leaving data behind.
-- Run after backend/ingestion/mvp_scale_records.sql has been applied.
-- Expected final row:
--   user_a_completed_visible = true
--   user_b_visible_attempts = 0
--   user_b_updated_attempts = 0
-- =============================================================================

BEGIN;

INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'mvp-rls-user-a@example.test',
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'mvp-rls-user-b@example.test',
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.role = 'authenticated';
SET LOCAL request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';

INSERT INTO user_scale_attempts (
  id,
  user_id,
  scale_code,
  status,
  notes
) VALUES (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'MWI',
  'started',
  'rollback rls smoke'
);

UPDATE user_scale_attempts
SET
  status = 'completed',
  total_score = 6,
  completed_at = now()
WHERE id = '00000000-0000-4000-8000-000000000101'
  AND user_id = '00000000-0000-4000-8000-000000000001';

SET LOCAL request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';

WITH user_b_update AS (
  UPDATE user_scale_attempts
  SET notes = 'user b should not update this row'
  WHERE id = '00000000-0000-4000-8000-000000000101'
  RETURNING id
),
user_b_read AS (
  SELECT count(*)::int AS visible_attempts
  FROM user_scale_attempts
  WHERE id = '00000000-0000-4000-8000-000000000101'
),
user_b_result AS (
  SELECT
    (SELECT visible_attempts FROM user_b_read) AS user_b_visible_attempts,
    (SELECT count(*)::int FROM user_b_update) AS user_b_updated_attempts
)
SELECT *
INTO TEMP TABLE mvp_rls_smoke_result
FROM user_b_result;

SET LOCAL request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';

SELECT
  (
    SELECT count(*) = 1
    FROM user_scale_attempts
    WHERE id = '00000000-0000-4000-8000-000000000101'
      AND status = 'completed'
      AND total_score = 6
  ) AS user_a_completed_visible,
  user_b_visible_attempts,
  user_b_updated_attempts
FROM mvp_rls_smoke_result;

ROLLBACK;
