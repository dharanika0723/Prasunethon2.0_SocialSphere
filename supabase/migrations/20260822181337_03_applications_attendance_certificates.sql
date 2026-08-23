/*
# Applications, attendance, certificates

1. New Tables
- `applications`
  - id uuid PK
  - campaign_id uuid FK campaigns
  - volunteer_id uuid FK profiles
  - status text — pending, accepted, rejected, completed
  - match_score int (0-100)
  - match_reasons text[]
  - applied_at timestamptz
  - decision_at timestamptz nullable
  - unique(campaign_id, volunteer_id)

- `attendance`
  - id uuid PK
  - application_id uuid FK applications
  - date date
  - hours numeric
  - status text — present, absent, excused
  - notes text
  - unique(application_id, date)

- `certificates`
  - id uuid PK
  - volunteer_id uuid FK profiles
  - campaign_id uuid FK campaigns
  - certificate_number text unique
  - hours numeric
  - people_impacted int
  - issued_at timestamptz
  - unique(volunteer_id, campaign_id)

2. Security
- RLS enabled on all. Volunteers can read/update-own application; campaign org can manage applications for their campaigns.
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
  match_score int NOT NULL DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons text[] DEFAULT '{}',
  applied_at timestamptz NOT NULL DEFAULT now(),
  decision_at timestamptz
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select" ON applications;
CREATE POLICY "applications_select" ON applications FOR SELECT
  TO authenticated USING (
    volunteer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM campaigns c WHERE c.id = applications.campaign_id AND c.organization_id = auth.uid())
  );

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  TO authenticated WITH CHECK (volunteer_id = auth.uid());

DROP POLICY IF EXISTS "applications_update" ON applications;
CREATE POLICY "applications_update" ON applications FOR UPDATE
  TO authenticated USING (
    volunteer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM campaigns c WHERE c.id = applications.campaign_id AND c.organization_id = auth.uid())
  )
  WITH CHECK (
    volunteer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM campaigns c WHERE c.id = applications.campaign_id AND c.organization_id = auth.uid())
  );

DROP POLICY IF EXISTS "applications_delete" ON applications;
CREATE POLICY "applications_delete" ON applications FOR DELETE
  TO authenticated USING (volunteer_id = auth.uid());

CREATE UNIQUE INDEX IF NOT EXISTS idx_app_unique ON applications(campaign_id, volunteer_id);

CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  date date NOT NULL,
  hours numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','excused')),
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_select" ON attendance;
CREATE POLICY "attendance_select" ON attendance FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM applications a WHERE a.id = attendance.application_id AND a.volunteer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM applications a JOIN campaigns c ON c.id = a.campaign_id WHERE a.id = attendance.application_id AND c.organization_id = auth.uid())
  );

DROP POLICY IF EXISTS "attendance_insert_org" ON attendance;
CREATE POLICY "attendance_insert_org" ON attendance FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM applications a JOIN campaigns c ON c.id = a.campaign_id WHERE a.id = attendance.application_id AND c.organization_id = auth.uid())
  );

DROP POLICY IF EXISTS "attendance_update_org" ON attendance;
CREATE POLICY "attendance_update_org" ON attendance FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM applications a JOIN campaigns c ON c.id = a.campaign_id WHERE a.id = attendance.application_id AND c.organization_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM applications a JOIN campaigns c ON c.id = a.campaign_id WHERE a.id = attendance.application_id AND c.organization_id = auth.uid())
  );

DROP POLICY IF EXISTS "attendance_delete_org" ON attendance;
CREATE POLICY "attendance_delete_org" ON attendance FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM applications a JOIN campaigns c ON c.id = a.campaign_id WHERE a.id = attendance.application_id AND c.organization_id = auth.uid())
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON attendance(application_id, date);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  hours numeric NOT NULL DEFAULT 0,
  people_impacted int NOT NULL DEFAULT 0,
  issued_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates_select" ON certificates;
CREATE POLICY "certificates_select" ON certificates FOR SELECT
  TO authenticated USING (
    volunteer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM campaigns c WHERE c.id = certificates.campaign_id AND c.organization_id = auth.uid())
  );

DROP POLICY IF EXISTS "certificates_insert_org" ON certificates;
CREATE POLICY "certificates_insert_org" ON certificates FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = certificates.campaign_id AND c.organization_id = auth.uid())
  );

DROP POLICY IF EXISTS "certificates_delete" ON certificates;
CREATE POLICY "certificates_delete" ON certificates FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = certificates.campaign_id AND c.organization_id = auth.uid())
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_cert_unique ON certificates(volunteer_id, campaign_id);
