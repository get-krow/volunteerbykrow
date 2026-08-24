import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hydufkheawsdbtfukaex.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5ZHVma2hlYXdzZGJ0ZnVrYWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NTQ0NjAsImV4cCI6MjEwMzAzMDQ2MH0.fvyLkHbq4jh8V_AXxZirGeUo_Jtl04L817OIL6f6amc';

export const isSupabaseConfigured = () => true;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
