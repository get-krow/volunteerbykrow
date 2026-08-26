export type SystemRole = 'volunteer' | 'organizer' | 'krow_admin';
export type VerificationStatus = 'pending' | 'verified';
export type LocationType = 'physical' | 'online' | 'tbd';
export type OpportunityStatus = 'published' | 'cancelled' | 'ended' | 'archived';
export type RegistrationStatus = 'registered' | 'unsigned' | 'cancelled' | 'completed';
export type AttendanceStatus = 'unmarked' | 'here' | 'not_here';
export type RecurrenceType = 'same_volunteers' | 'different_volunteers';

export interface UserProfile {
  id: string;
  role: SystemRole;
  email: string;
  name: string;
  dob?: string | null; // YYYY-MM-DD
  country: string;
  province_state: string;
  city: string;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface OrganizerProfile {
  id: string;
  org_name: string;
  hq_country?: string | null;
  hq_province_state?: string | null;
  hq_city?: string | null;
  hq_address?: string | null;
  hq_place_id?: string | null;
  no_hq: boolean;
  bio?: string | null;
  logo_url?: string | null;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  is_custom: boolean;
}

export interface Opportunity {
  id: string;
  org_id: string;
  org_name?: string;
  org_verification_status?: VerificationStatus;
  org_logo_url?: string | null;
  title: string;
  description: string;
  instructions?: string;
  category_id: string;
  custom_role?: string;
  banner_url?: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM 24h or format
  end_time: string;
  duration_hours: number;
  location_type: LocationType;
  location_address?: string;
  location_place_id?: string;
  min_age?: number | null;
  max_age?: number | null;
  max_volunteers?: number | null;
  is_recurring?: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_series_id?: string;
  status: OpportunityStatus;
  registered_count?: number;
  ended_at?: string;
  created_at: string;
}

export interface Registration {
  id: string;
  opportunity_id: string;
  volunteer_id: string;
  registered_at: string;
  status: RegistrationStatus;
}

export interface AttendanceRecord {
  id: string;
  opportunity_id: string;
  volunteer_id: string;
  volunteer_name?: string;
  volunteer_avatar?: string;
  volunteer_badge?: BadgeDefinition;
  status: AttendanceStatus;
  hours_awarded: number;
  is_verified_org_at_completion: boolean;
  marked_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  min_hours: number;
  icon_name: string;
  color: string;
  order_index: number;
}

export interface HourAuditLog {
  id: string;
  attendance_id: string;
  volunteer_id: string;
  opportunity_id: string;
  original_hours: number;
  new_hours: number;
  edited_by: string;
  edited_by_name?: string;
  reason?: string;
  created_at: string;
}
