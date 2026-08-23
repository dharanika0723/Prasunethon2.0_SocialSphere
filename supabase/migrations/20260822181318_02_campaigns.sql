/*
# Campaigns table

1. New Tables
- `campaigns`
  - id (uuid PK)
  - organization_id (uuid FK profiles)
  - title (text)
  - description (text)
  - goal (text)
  - category (text) — education, healthcare, environment, food, disaster_relief, digital_literacy, women_empowerment, rural_development
  - location (text)
  - target_community (text)
  - required_volunteers (int)
  - required_skills (text[])
  - languages (text[])
  - start_date (date)
  - end_date (date)
  - status (text) — draft, published, ongoing, completed, cancelled
  - campaign_type (text) — standard, emergency, csr
  - people_impacted (int default 0)
  - image_url (text)
  - created_at, updated_at

2. Security
- RLS enabled. Authenticated can read published/ongoing/completed; organization owners can CRUD their own.
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  goal text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'education' CHECK (category IN ('education','healthcare','environment','food','disaster_relief','digital_literacy','women_empowerment','rural_development')),
  location text NOT NULL DEFAULT '',
  target_community text NOT NULL DEFAULT '',
  required_volunteers int NOT NULL DEFAULT 5,
  required_skills text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','ongoing','completed','cancelled')),
  campaign_type text NOT NULL DEFAULT 'standard' CHECK (campaign_type IN ('standard','emergency','csr')),
  people_impacted int NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "campaigns_select_visible" ON campaigns;
CREATE POLICY "campaigns_select_visible" ON campaigns FOR SELECT
  TO authenticated USING (status IN ('published','ongoing','completed') OR organization_id = auth.uid());

DROP POLICY IF EXISTS "campaigns_insert_own" ON campaigns;
CREATE POLICY "campaigns_insert_own" ON campaigns FOR INSERT
  TO authenticated WITH CHECK (organization_id = auth.uid());

DROP POLICY IF EXISTS "campaigns_update_own" ON campaigns;
CREATE POLICY "campaigns_update_own" ON campaigns FOR UPDATE
  TO authenticated USING (organization_id = auth.uid()) WITH CHECK (organization_id = auth.uid());

DROP POLICY IF EXISTS "campaigns_delete_own" ON campaigns;
CREATE POLICY "campaigns_delete_own" ON campaigns FOR DELETE
  TO authenticated USING (organization_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
