export type UserRole = "volunteer" | "organization" | "admin" | "super_admin";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";

export type HoursStatus = "pending" | "approved" | "rejected";

export type OpportunityStatus = "draft" | "published" | "closed" | "archived";

export type OrganizationType =
  | "nonprofit"
  | "school"
  | "club"
  | "charity"
  | "government"
  | "community"
  | "other";

export type NotificationType =
  | "application_received"
  | "application_approved"
  | "application_rejected"
  | "hours_approved"
  | "hours_rejected"
  | "message"
  | "announcement"
  | "system";

export type DocumentType = "verification" | "certificate" | "report" | "other";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  total_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  type: OrganizationType;
  verification_status: VerificationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string | null;
  capacity: number | null;
  spots_filled: number;
  volunteer_hours: number;
  skills_required: string[];
  tags: string[];
  category_id: string | null;
  status: OpportunityStatus;
  images: string[];
  is_remote: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  organization?: Organization;
  category?: Category;
}

export interface Application {
  id: string;
  opportunity_id: string;
  volunteer_id: string;
  status: ApplicationStatus;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  // Joined fields
  opportunity?: Opportunity;
  volunteer?: Profile;
}

export interface VolunteerHours {
  id: string;
  volunteer_id: string;
  opportunity_id: string;
  organization_id: string;
  hours: number;
  date: string;
  status: HoursStatus;
  notes: string | null;
  created_at: string;
  // Joined fields
  opportunity?: Opportunity;
  volunteer?: Profile;
  organization?: Organization;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Joined
  sender?: Profile;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  // Joined
  participants?: Profile[];
  messages?: Message[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  created_at: string;
  opportunity?: Opportunity;
}

export interface Review {
  id: string;
  user_id: string;
  opportunity_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: Profile;
}

export interface Certificate {
  id: string;
  user_id: string;
  opportunity_id: string;
  hours: number;
  certificate_url: string | null;
  issued_at: string;
  opportunity?: Opportunity;
}

export interface Document {
  id: string;
  organization_id: string;
  name: string;
  file_url: string;
  type: DocumentType;
  uploaded_at: string;
}

export interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  user?: Profile;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
