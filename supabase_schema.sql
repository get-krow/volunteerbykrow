-- Volunteer by Krow — Database Schema & Row Level Security (RLS)
-- Supabase PostgreSQL Engine

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('volunteer', 'organizer', 'krow_admin')),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  dob DATE,
  country TEXT DEFAULT 'Canada',
  province_state TEXT DEFAULT 'BC',
  city TEXT DEFAULT 'Coquitlam',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organizer Profiles Table
CREATE TABLE IF NOT EXISTS public.organizer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_name TEXT NOT NULL,
  hq_country TEXT,
  hq_province_state TEXT,
  hq_city TEXT,
  hq_address TEXT,
  hq_place_id TEXT,
  no_hq BOOLEAN DEFAULT FALSE,
  bio TEXT,
  logo_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial System Categories
INSERT INTO public.categories (id, name, is_custom) VALUES
  ('education', 'Education', false),
  ('environment', 'Environment', false),
  ('sports', 'Sports', false),
  ('community', 'Community', false),
  ('health', 'Health', false),
  ('animals', 'Animals', false),
  ('arts_culture', 'Arts & Culture', false),
  ('events', 'Events', false),
  ('food_hunger', 'Food & Hunger', false),
  ('seniors', 'Seniors', false),
  ('youth', 'Youth', false),
  ('fundraising', 'Fundraising', false),
  ('technology', 'Technology', false),
  ('other', 'Other', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  category_id TEXT REFERENCES public.categories(id),
  custom_role TEXT,
  banner_url TEXT,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_hours NUMERIC NOT NULL CHECK (duration_hours > 0),
  location_type TEXT NOT NULL DEFAULT 'physical' CHECK (location_type IN ('physical', 'online', 'tbd')),
  location_address TEXT,
  location_place_id TEXT,
  min_age INT,
  max_age INT,
  max_volunteers INT, -- NULL means unlimited
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT CHECK (recurrence_type IN ('same_volunteers', 'different_volunteers')),
  recurrence_series_id UUID,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'cancelled', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'unsigned', 'cancelled')),
  CONSTRAINT unique_active_registration UNIQUE (opportunity_id, volunteer_id)
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unmarked' CHECK (status IN ('unmarked', 'here', 'not_here')),
  hours_awarded NUMERIC NOT NULL DEFAULT 0,
  is_verified_org_at_completion BOOLEAN NOT NULL DEFAULT FALSE,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_opportunity_attendance UNIQUE (opportunity_id, volunteer_id)
);

-- 7. Hour Audit Logs Table
CREATE TABLE IF NOT EXISTS public.hour_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendance_id UUID NOT NULL REFERENCES public.attendance(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  original_hours NUMERIC NOT NULL,
  new_hours NUMERIC NOT NULL,
  edited_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Saved Opportunities Table
CREATE TABLE IF NOT EXISTS public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_volunteer_saved UNIQUE (volunteer_id, opportunity_id)
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Badge Definitions Table
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_hours NUMERIC NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INT NOT NULL
);

INSERT INTO public.badge_definitions (id, name, min_hours, icon_name, color, order_index) VALUES
  ('newbie', 'Krow Rookie', 0, 'Sparkles', '#94A3B8', 1),
  ('bronze', 'Bronze Volunteer', 10, 'Award', '#D97706', 2),
  ('silver', 'Silver Volunteer', 25, 'Medal', '#64748B', 3),
  ('gold', 'Gold Community Pillar', 50, 'Crown', '#EAB308', 4),
  ('platinum', 'Platinum Champion', 100, 'Zap', '#8B5CF6', 5),
  ('diamond', 'Diamond Legend', 250, 'Flame', '#06B6D4', 6)
ON CONFLICT (id) DO NOTHING;

-- ATOMIC REGISTRATION FUNCTION (Race-condition safe)
CREATE OR REPLACE FUNCTION register_for_opportunity(
  p_opportunity_id UUID,
  p_volunteer_id UUID
) RETURNS JSON AS $$
DECLARE
  v_opp RECORD;
  v_current_count INT;
  v_volunteer RECORD;
  v_age_on_event INT;
  v_existing public.registrations%ROWTYPE;
BEGIN
  -- Fetch Opportunity
  SELECT * INTO v_opp FROM public.opportunities WHERE id = p_opportunity_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Opportunity not found');
  END IF;

  IF v_opp.status != 'published' THEN
    RETURN json_build_object('success', false, 'message', 'Opportunity is no longer active');
  END IF;

  -- Check Date cutoff
  IF CURRENT_DATE > v_opp.date THEN
    RETURN json_build_object('success', false, 'message', 'Registration closed for past events');
  END IF;

  -- Fetch Volunteer Age on Event Date
  SELECT * INTO v_volunteer FROM public.profiles WHERE id = p_volunteer_id;
  IF v_volunteer.dob IS NOT NULL THEN
    v_age_on_event := EXTRACT(YEAR FROM AGE(v_opp.date, v_volunteer.dob));
    IF v_opp.min_age IS NOT NULL AND v_age_on_event < v_opp.min_age THEN
      RETURN json_build_object('success', false, 'message', 'You do not meet the minimum age requirement for this date.');
    END IF;
    IF v_opp.max_age IS NOT NULL AND v_age_on_event > v_opp.max_age THEN
      RETURN json_build_object('success', false, 'message', 'You exceed the maximum age requirement for this date.');
    END IF;
  END IF;

  -- Check Capacity
  IF v_opp.max_volunteers IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count 
    FROM public.registrations 
    WHERE opportunity_id = p_opportunity_id AND status = 'registered';

    IF v_current_count >= v_opp.max_volunteers THEN
      RETURN json_build_object('success', false, 'message', 'Opportunity is full');
    END IF;
  END IF;

  -- Upsert Registration
  INSERT INTO public.registrations (opportunity_id, volunteer_id, status)
  VALUES (p_opportunity_id, p_volunteer_id, 'registered')
  ON CONFLICT (opportunity_id, volunteer_id) 
  DO UPDATE SET status = 'registered', registered_at = NOW();

  -- Create Notification
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (
    p_volunteer_id, 
    'Registration Confirmed', 
    'You are registered for ' || v_opp.title, 
    'registration_confirmed', 
    '/dashboard'
  );

  RETURN json_build_object('success', true, 'message', 'Registration confirmed!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROW LEVEL SECURITY POLICIES (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true);

-- 2. Organizer Profiles Policies
DROP POLICY IF EXISTS "Public read organizer profiles" ON public.organizer_profiles;
DROP POLICY IF EXISTS "Allow public insert organizer profiles" ON public.organizer_profiles;
DROP POLICY IF EXISTS "Allow public update organizer profiles" ON public.organizer_profiles;

CREATE POLICY "Public read organizer profiles" ON public.organizer_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert organizer profiles" ON public.organizer_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update organizer profiles" ON public.organizer_profiles FOR UPDATE USING (true);

-- 3. Opportunities Policies
DROP POLICY IF EXISTS "Public read opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Organizers insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Organizers update own opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Allow public insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Allow public update opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Allow public delete opportunities" ON public.opportunities;

CREATE POLICY "Public read opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow public insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update opportunities" ON public.opportunities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete opportunities" ON public.opportunities FOR DELETE USING (true);

-- 4. Registrations & Attendance Policies
DROP POLICY IF EXISTS "Allow public insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public read registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public update registrations" ON public.registrations;

CREATE POLICY "Allow public insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Allow public update registrations" ON public.registrations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public manage attendance" ON public.attendance;
CREATE POLICY "Allow public manage attendance" ON public.attendance FOR ALL USING (true);

-- 5. Saved & Notifications Policies
DROP POLICY IF EXISTS "Allow public manage saved" ON public.saved_opportunities;
CREATE POLICY "Allow public manage saved" ON public.saved_opportunities FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public manage notifications" ON public.notifications;
CREATE POLICY "Allow public manage notifications" ON public.notifications FOR ALL USING (true);
