/*
# Profiles and role system

1. New Tables
- `profiles` — extends auth.users with role, name, avatar, and role-specific profile data.
  - id (uuid, PK, references auth.users)
  - email (text, unique)
  - full_name (text)
  - role (text, one of volunteer|ngo|college|company|government)
  - avatar_url (text, nullable)
  - bio (text, nullable)
  - location (text, nullable)
  - skills (text[], default empty)
  - interests (text[], default empty)
  - languages (text[], default empty)
  - availability (text, nullable) — e.g. "Weekends", "Full-time"
  - organization_name (text, nullable) — for non-volunteer roles
  - organization_type (text, nullable)
  - verified (boolean, default false)
  - impact_score (int, default 0)
  - volunteer_hours (numeric, default 0)
  - people_impacted (int, default 0)
  - campaigns_completed (int, default 0)
  - created_at (timestamptz)

2. Security
- RLS enabled on profiles.
- Users can read all profiles (public directory), update only their own.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'volunteer' CHECK (role IN ('volunteer','ngo','college','company','government')),
  avatar_url text,
  bio text,
  location text,
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  availability text,
  organization_name text,
  organization_type text,
  verified boolean NOT NULL DEFAULT false,
  impact_score int NOT NULL DEFAULT 0,
  volunteer_hours numeric NOT NULL DEFAULT 0,
  people_impacted int NOT NULL DEFAULT 0,
  campaigns_completed int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);
