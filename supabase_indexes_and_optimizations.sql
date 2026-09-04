-- ==============================================================================
-- Krow Database Optimization Migration: Indexes & Performance Constraints
-- Optimized for Supabase Free Tier (Reduces CPU, Disk I/O & Query Latency)
-- Safe & idempotent: handles existing/missing columns and tables gracefully
-- ==============================================================================

-- 0. Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure public.profiles has krow_id column
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS krow_id TEXT;

-- 2. Ensure Certificates Table Definition & Schema
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  krow_id TEXT,
  student_name TEXT,
  hours NUMERIC NOT NULL DEFAULT 0,
  activity_count INT NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'VALID' CHECK (status IN ('VALID', 'REVOKED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on public.certificates in case it existed before
ALTER TABLE IF EXISTS public.certificates ADD COLUMN IF NOT EXISTS krow_id TEXT;
ALTER TABLE IF EXISTS public.certificates ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE IF EXISTS public.certificates ADD COLUMN IF NOT EXISTS hours NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.certificates ADD COLUMN IF NOT EXISTS activity_count INT NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS public.certificates ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'VALID';

-- Enable RLS on certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read certificates" ON public.certificates;
CREATE POLICY "Public read certificates" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert certificates" ON public.certificates;
CREATE POLICY "Allow authenticated insert certificates" ON public.certificates FOR INSERT WITH CHECK (true);

-- 3. Registrations Indexes (Frequently filtered by volunteer_id and opportunity_id)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations') THEN
    CREATE INDEX IF NOT EXISTS idx_registrations_volunteer_id ON public.registrations(volunteer_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_opportunity_id ON public.registrations(opportunity_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_vol_status ON public.registrations(volunteer_id, status);
  END IF;
END $$;

-- 4. Attendance Indexes (Frequently filtered by volunteer_id and opportunity_id)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_volunteer_id ON public.attendance(volunteer_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_opportunity_id ON public.attendance(opportunity_id);
  END IF;
END $$;

-- 5. Opportunities Indexes (Frequently filtered by status, date, org_id, and category)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
    CREATE INDEX IF NOT EXISTS idx_opportunities_org_id ON public.opportunities(org_id);
    CREATE INDEX IF NOT EXISTS idx_opportunities_status_date ON public.opportunities(status, date);
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'opportunities' AND column_name = 'category_id') THEN
      CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category_id);
    END IF;
  END IF;
END $$;

-- 6. Certificates Indexes (Lookups by certificate_id on /verify and user_id on profile)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'certificates') THEN
    CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(certificate_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
  END IF;
END $$;

-- 7. Profiles Indexes (Lookup by krow_id)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'krow_id') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_krow_id ON public.profiles(krow_id);
  END IF;
END $$;

-- 8. Notifications Indexes (Filtered by user_id)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
  END IF;
END $$;

-- 9. Contact Messages Indexes (Admin sorting by created_at)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contact_messages') THEN
    CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
  END IF;
END $$;
