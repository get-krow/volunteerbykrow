export type SystemRole = 'volunteer' | 'organizer' | 'krow_admin';
export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'pending'
  | 'verified';

export type LocationType = 'physical' | 'online' | 'tbd';
export type OpportunityStatus = 'published' | 'cancelled' | 'ended' | 'archived';
export type RegistrationStatus = 'registered' | 'unsigned' | 'cancelled' | 'completed';
export type AttendanceStatus = 'unmarked' | 'here' | 'not_here';
export type RecurrenceType = 'same_volunteers' | 'different_volunteers';
export type RecurrenceFrequency = 'every_day' | 'every_week' | 'every_other_week' | 'every_month';

export interface UserProfile {
  id: string;
  krow_id?: string;
  role: SystemRole;
  email: string;
  name: string;
  dob?: string | null; // YYYY-MM-DD
  country: string;
  province_state: string;
  city: string;
  location_set?: boolean;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface OrgRepresentative {
  full_name: string;
  role: string;
  email: string;
  phone: string;
  email_verified: boolean;
  verification_code?: string;
}

export interface OrgVerificationDocument {
  id: string;
  organization_id: string;
  document_type: 'registration' | 'affiliation' | 'other';
  file_name: string;
  storage_path: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface OrgSafetyInfo {
  activities: string;
  locations: string[];
  supervisor_info: string;
  minors_allowed: boolean;
  background_checks: string;
  safety_requirements: string;
  agreed_rules: boolean;
}

export interface OrganizerProfile {
  id: string;
  org_name: string;
  legal_name?: string;
  public_name?: string;
  organization_type?: string;
  hq_country?: string | null;
  hq_province_state?: string | null;
  hq_city?: string | null;
  hq_address?: string | null;
  hq_place_id?: string | null;
  postal_code?: string;
  no_hq?: boolean;
  bio?: string | null;
  logo_url?: string | null;
  website?: string | null;
  phone?: string | null;
  email_domain?: string | null;
  registration_type?: string;
  registration_number?: string;
  registration_authority?: string;
  country_of_registration?: string;
  representative?: OrgRepresentative;
  documents?: OrgVerificationDocument[];
  safety_info?: OrgSafetyInfo;
  verification_status: VerificationStatus;
  status_reason?: string | null;
  submitted_at?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
  suspended_at?: string | null;
  suspended_by?: string | null;
  created_at: string;
}

export interface OrgVerificationCheck {
  id: string;
  organization_id: string;
  check_type: string;
  status: boolean;
  admin_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrgVerificationHistoryItem {
  id: string;
  organization_id: string;
  action: string;
  previous_status: VerificationStatus;
  new_status: VerificationStatus;
  admin_id: string;
  reason?: string;
  created_at: string;
}

export interface OrgAdminNote {
  id: string;
  organization_id: string;
  admin_id: string;
  admin_name?: string;
  note: string;
  created_at: string;
}

export type ReportType =
  | 'fake_organization'
  | 'impersonation'
  | 'unsafe_environment'
  | 'misleading_opportunity'
  | 'suspicious_behavior'
  | 'inappropriate_conduct'
  | 'opportunity_does_not_exist'
  | 'harassment'
  | 'other';

export interface OrganizationReport {
  id: string;
  organization_id: string;
  opportunity_id?: string;
  reporter_user_id: string;
  reporter_name?: string;
  report_type: ReportType;
  description: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
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
  recurrence_frequency?: RecurrenceFrequency;
  recurrence_series_id?: string;
  recurrence_count?: number;
  occurrence_number?: number;
  occurrence_dates?: string[];
  series_start_date?: string;
  series_end_date?: string;
  total_series_hours?: number;
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
  opportunity_title?: string;
  org_id?: string;
  org_name?: string;
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

export interface ContactMessage {
  id: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  category: 'hours_inquiry' | 'org_verification' | 'general' | 'other' | string;
  subject: string;
  message: string;
  is_read?: boolean;
  created_at: string;
}

export type CertificateStatus = 'VALID' | 'REVOKED';

export interface CertificateRecord {
  id: string;
  certificate_id: string; // e.g. CERT-4D92X7PQ
  user_id: string;
  krow_id: string; // e.g. KROW-8F4K2M91
  student_name: string;
  hours: number;
  activity_count: number;
  issued_at: string; // ISO date string
  status: CertificateStatus;
  created_at: string;
}
