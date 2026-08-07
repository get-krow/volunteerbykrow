-- ============================================================
-- Volunteer by KROW — Version 1 Schema Realignment
-- ============================================================

-- Add Location, Age & Registration Profile Fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS birthdate DATE,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS province_state TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS registering_for TEXT DEFAULT 'myself';

-- Add Location & Member Fields to Organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'United States',
  ADD COLUMN IF NOT EXISTS province_state TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS members_list TEXT[] DEFAULT '{}';

-- Add Age Eligibility & Contact Email to Opportunities
ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS age_eligibility INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- RPC Function for Permanent Account Deletion (Cascade delete profile & auth record)
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Remove user applications, logged hours, saved items
  DELETE FROM applications WHERE volunteer_id = current_user_id;
  DELETE FROM volunteer_hours WHERE volunteer_id = current_user_id;
  DELETE FROM saved_opportunities WHERE user_id = current_user_id;
  DELETE FROM profiles WHERE id = current_user_id;
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
