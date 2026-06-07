-- =============================================================================
-- EQAI MVP contact submissions
--
-- Public contact intake table. Visitors may submit inquiries, but public clients
-- cannot read submitted rows. Review submissions in Supabase Dashboard.
-- =============================================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL
    CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  email               TEXT NOT NULL
    CHECK (
      char_length(email) <= 254
      AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    ),
  inquiry_type        TEXT NOT NULL
    CHECK (inquiry_type IN (
      'assessment_interest',
      'partnership',
      'research',
      'review_feedback',
      'other'
    )),
  interested_category TEXT NOT NULL DEFAULT 'general'
    CHECK (interested_category IN ('general', 'work', 'personal', 'kid', 'pet')),
  audience_type       TEXT NOT NULL
    CHECK (audience_type IN (
      'self',
      'parent',
      'educator',
      'organization',
      'reviewer',
      'other'
    )),
  subject             TEXT NOT NULL
    CHECK (char_length(trim(subject)) BETWEEN 2 AND 160),
  message             TEXT NOT NULL
    CHECK (char_length(trim(message)) BETWEEN 10 AND 4000),
  consent_contact     BOOLEAN NOT NULL
    CHECK (consent_contact = true),
  source_locale       TEXT NOT NULL
    CHECK (source_locale IN ('en', 'zh')),
  user_agent          TEXT,
  status              TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'closed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE contact_submissions IS
  'MVP public contact and assessment interest intake. Public clients can insert only; reads are restricted.';

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status_created
  ON contact_submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_category_created
  ON contact_submissions (interested_category, created_at DESC);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON contact_submissions FROM PUBLIC;
REVOKE ALL ON contact_submissions FROM anon, authenticated;
GRANT INSERT ON contact_submissions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON contact_submissions TO service_role;

DROP POLICY IF EXISTS "contact_submissions_public_insert" ON contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_service_role_all" ON contact_submissions;

CREATE POLICY "contact_submissions_public_insert" ON contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    consent_contact = true
    AND source_locale IN ('en', 'zh')
    AND interested_category IN ('general', 'work', 'personal', 'kid', 'pet')
  );

CREATE POLICY "contact_submissions_service_role_all" ON contact_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
