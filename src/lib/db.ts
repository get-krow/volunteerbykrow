import {
  UserProfile,
  OrganizerProfile,
  Category,
  Opportunity,
  Registration,
  AttendanceRecord,
  NotificationItem,
  BadgeDefinition,
  HourAuditLog,
  VerificationStatus,
  RecurrenceType,
} from './types';
import { getBadgeForHours } from './badges';

// Initial Mock Seed Data for rich out-of-the-box local demo
const MOCK_CATEGORIES: Category[] = [
  { id: 'education', name: 'Education', is_custom: false },
  { id: 'environment', name: 'Environment', is_custom: false },
  { id: 'sports', name: 'Sports', is_custom: false },
  { id: 'community', name: 'Community', is_custom: false },
  { id: 'health', name: 'Health', is_custom: false },
  { id: 'animals', name: 'Animals', is_custom: false },
  { id: 'arts_culture', name: 'Arts & Culture', is_custom: false },
  { id: 'events', name: 'Events', is_custom: false },
  { id: 'food_hunger', name: 'Food & Hunger', is_custom: false },
  { id: 'seniors', name: 'Seniors', is_custom: false },
  { id: 'youth', name: 'Youth', is_custom: false },
  { id: 'fundraising', name: 'Fundraising', is_custom: false },
  { id: 'technology', name: 'Technology', is_custom: false },
  { id: 'other', name: 'Other', is_custom: false },
];

const MOCK_ORGANIZERS: OrganizerProfile[] = [
  {
    id: 'org-krow',
    org_name: 'Krow Organization',
    hq_country: 'Canada',
    hq_province_state: 'BC',
    hq_city: 'Coquitlam',
    hq_address: 'Coquitlam, BC',
    no_hq: false,
    bio: 'Official Krow Volunteer Community Organization.',
    logo_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&auto=format&fit=crop&q=80',
    verification_status: 'verified',
    created_at: new Date().toISOString(),
  },
  {
    id: 'org-1',
    org_name: 'Metro Vancouver Food Bank',
    hq_country: 'Canada',
    hq_province_state: 'BC',
    hq_city: 'Vancouver',
    hq_address: '1428 Charles St, Vancouver, BC',
    no_hq: false,
    bio: 'Dedicated to providing fresh, nutritious food to families in need across Metro Vancouver.',
    logo_url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&auto=format&fit=crop&q=80',
    verification_status: 'verified',
    created_at: new Date().toISOString(),
  },
  {
    id: 'org-2',
    org_name: 'Tri-City Eco Alliance',
    hq_country: 'Canada',
    hq_province_state: 'BC',
    hq_city: 'Coquitlam',
    hq_address: '1200 Pipeline Rd, Coquitlam, BC',
    no_hq: false,
    bio: 'Protecting rivers, trails, and urban green spaces in Coquitlam, Port Moody, and Port Coquitlam.',
    logo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80',
    verification_status: 'verified',
    created_at: new Date().toISOString(),
  },
];

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-krow-1',
    org_id: 'org-krow',
    org_name: 'Krow Organization',
    org_verification_status: 'verified',
    org_logo_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&auto=format&fit=crop&q=80',
    title: 'Test (Session 1 of 10)',
    description: 'Community volunteer event session 1. Sign up to participate.',
    instructions: 'Please arrive 10 minutes early.',
    category_id: 'other',
    custom_role: 'General',
    banner_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80',
    date: '2026-08-19',
    start_time: '15:30',
    end_time: '17:30',
    duration_hours: 2,
    location_type: 'physical',
    location_address: 'Test',
    min_age: null,
    max_age: null,
    max_volunteers: 20,
    status: 'published',
    registered_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-krow-2',
    org_id: 'org-krow',
    org_name: 'Krow Organization',
    org_verification_status: 'verified',
    org_logo_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&auto=format&fit=crop&q=80',
    title: 'Test (Session 2 of 10)',
    description: 'Community volunteer event session 2. Sign up to participate.',
    instructions: 'Please arrive 10 minutes early.',
    category_id: 'other',
    custom_role: 'General',
    banner_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80',
    date: '2026-08-26',
    start_time: '15:30',
    end_time: '17:30',
    duration_hours: 2,
    location_type: 'physical',
    location_address: 'Test',
    min_age: null,
    max_age: null,
    max_volunteers: 20,
    status: 'published',
    registered_count: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp-krow-3',
    org_id: 'org-krow',
    org_name: 'Krow Organization',
    org_verification_status: 'verified',
    org_logo_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=300&auto=format&fit=crop&q=80',
    title: 'Test (Session 3 of 10)',
    description: 'Community volunteer event session 3. Sign up to participate.',
    instructions: 'Please arrive 10 minutes early.',
    category_id: 'other',
    custom_role: 'General',
    banner_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80',
    date: '2026-09-02',
    start_time: '15:30',
    end_time: '17:30',
    duration_hours: 2,
    location_type: 'physical',
    location_address: 'Test',
    min_age: null,
    max_age: null,
    max_volunteers: 20,
    status: 'published',
    registered_count: 0,
    created_at: new Date().toISOString(),
  },
];

const MOCK_VOLUNTEER: UserProfile = {
  id: 'vol-1',
  role: 'volunteer',
  email: 'alex.volunteer@example.com',
  name: 'Alex Chen',
  dob: '2004-05-15',
  country: 'Canada',
  province_state: 'BC',
  city: 'Coquitlam',
  bio: 'High school graduate passionate about environmental conservation and community hunger relief.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString(),
};

// In-Memory state manager for local client session
class LocalDatabase {
  private categories: Category[] = MOCK_CATEGORIES;
  private organizers: OrganizerProfile[] = MOCK_ORGANIZERS;
  private opportunities: Opportunity[] = MOCK_OPPORTUNITIES;
  private currentUser: UserProfile | null = MOCK_VOLUNTEER;
  private registrations: Registration[] = [];
  private attendance: AttendanceRecord[] = [];
  private notifications: NotificationItem[] = [];
  private savedOpportunityIds: string[] = [];
  private hourAuditLogs: HourAuditLog[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('krow_categories', JSON.stringify(this.categories));
      localStorage.setItem('krow_organizers', JSON.stringify(this.organizers));
      localStorage.setItem('krow_opportunities', JSON.stringify(this.opportunities));
      localStorage.setItem('krow_currentUser', JSON.stringify(this.currentUser));
      localStorage.setItem('krow_registrations', JSON.stringify(this.registrations));
      localStorage.setItem('krow_attendance', JSON.stringify(this.attendance));
      localStorage.setItem('krow_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('krow_saved', JSON.stringify(this.savedOpportunityIds));
      localStorage.setItem('krow_audit', JSON.stringify(this.hourAuditLogs));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }

  private loadFromStorage() {
    try {
      const storedCategories = localStorage.getItem('krow_categories');
      if (storedCategories) this.categories = JSON.parse(storedCategories);

      const storedOrganizers = localStorage.getItem('krow_organizers');
      if (storedOrganizers) this.organizers = JSON.parse(storedOrganizers);

      const storedOpps = localStorage.getItem('krow_opportunities');
      if (storedOpps) this.opportunities = JSON.parse(storedOpps);

      const storedUser = localStorage.getItem('krow_currentUser');
      if (storedUser) this.currentUser = JSON.parse(storedUser);

      const storedRegs = localStorage.getItem('krow_registrations');
      if (storedRegs) this.registrations = JSON.parse(storedRegs);

      const storedAtt = localStorage.getItem('krow_attendance');
      if (storedAtt) this.attendance = JSON.parse(storedAtt);

      const storedNotifs = localStorage.getItem('krow_notifications');
      if (storedNotifs) this.notifications = JSON.parse(storedNotifs);

      const storedSaved = localStorage.getItem('krow_saved');
      if (storedSaved) this.savedOpportunityIds = JSON.parse(storedSaved);

      const storedAudit = localStorage.getItem('krow_audit');
      if (storedAudit) this.hourAuditLogs = JSON.parse(storedAudit);
    } catch (e) {
      console.error('Storage load error', e);
    }
  }

  // --- Auth / User State ---
  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public setCurrentUser(user: UserProfile | null) {
    this.currentUser = user;
    this.saveToStorage();
  }

  public updateProfile(updates: Partial<UserProfile>) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveToStorage();
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return this.categories;
  }

  public addCategory(name: string): Category {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = this.categories.find((c) => c.id === id);
    if (existing) return existing;

    const newCat: Category = { id, name, is_custom: true };
    this.categories.push(newCat);
    this.saveToStorage();
    return newCat;
  }

  // --- Organizers & Verification ---
  public getOrganizers(): OrganizerProfile[] {
    return this.organizers;
  }

  public getOrganizer(id: string): OrganizerProfile | undefined {
    return this.organizers.find((o) => o.id === id);
  }

  public updateOrganizerVerification(orgId: string, status: VerificationStatus) {
    const org = this.organizers.find((o) => o.id === orgId);
    if (!org) return;

    const oldStatus = org.verification_status;
    org.verification_status = status;

    // Update opps org_verification_status
    this.opportunities.forEach((opp) => {
      if (opp.org_id === orgId) {
        opp.org_verification_status = status;
      }
    });

    // Generate in-app notification for Organizer
    const title = status === 'verified' ? 'Organization Verified!' : 'Organization Status Revoked';
    const message =
      status === 'verified'
        ? `Congratulations! ${org.org_name} has been verified by Krow Admin. You can now award verified volunteer hours.`
        : `${org.org_name} status has been changed to Pending. New volunteer shifts will receive 0 awarded hours until re-verified.`;

    this.addNotification({
      user_id: org.id,
      title,
      message,
      type: status === 'verified' ? 'org_verified' : 'org_revoked',
    });

    this.saveToStorage();
  }

  // --- Opportunities ---
  public getOpportunities(): Opportunity[] {
    return this.opportunities.map((opp) => {
      const activeRegs = this.registrations.filter(
        (r) => r.opportunity_id === opp.id && r.status === 'registered'
      ).length;
      return {
        ...opp,
        registered_count: activeRegs,
      };
    });
  }

  public getOpportunity(id: string): Opportunity | undefined {
    const opps = this.getOpportunities();
    return opps.find((o) => o.id === id);
  }

  public createOpportunity(oppData: Omit<Opportunity, 'id' | 'created_at' | 'status'>): Opportunity {
    const org = this.organizers.find((o) => o.id === oppData.org_id);
    const newOpp: Opportunity = {
      ...oppData,
      id: 'opp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      org_name: org?.org_name || 'Organization',
      org_verification_status: org?.verification_status || 'pending',
      org_logo_url: org?.logo_url || undefined,
      status: 'published',
      registered_count: 0,
      created_at: new Date().toISOString(),
    };

    this.opportunities.push(newOpp);
    this.saveToStorage();
    return newOpp;
  }

  public updateOpportunity(id: string, updates: Partial<Opportunity>): Opportunity | null {
    const opp = this.opportunities.find((o) => o.id === id);
    if (!opp) return null;

    Object.assign(opp, updates);

    // Notify registered volunteers of update
    const registeredVolunteers = this.registrations
      .filter((r) => r.opportunity_id === id && r.status === 'registered')
      .map((r) => r.volunteer_id);

    registeredVolunteers.forEach((volId) => {
      this.addNotification({
        user_id: volId,
        title: 'Opportunity Updated',
        message: `The organizer has updated details for "${opp.title}". Check your dashboard for updated times or location.`,
        type: 'opp_updated',
        link: '/dashboard',
      });
    });

    this.saveToStorage();
    return opp;
  }

  public cancelOpportunity(id: string) {
    const opp = this.opportunities.find((o) => o.id === id);
    if (!opp) return;

    opp.status = 'cancelled';

    // Notify registered volunteers
    const activeRegs = this.registrations.filter((r) => r.opportunity_id === id && r.status === 'registered');
    activeRegs.forEach((reg) => {
      reg.status = 'cancelled';
      this.addNotification({
        user_id: reg.volunteer_id,
        title: 'Opportunity Cancelled',
        message: `"${opp.title}" has been cancelled by the organizer.`,
        type: 'opp_cancelled',
        link: '/dashboard',
      });
    });

    this.saveToStorage();
  }

  // --- Registration Logic ---
  public registerForOpportunity(opportunityId: string, volunteerId: string): { success: boolean; message: string } {
    const opp = this.opportunities.find((o) => o.id === opportunityId);
    if (!opp) return { success: false, message: 'Opportunity not found' };

    if (opp.status !== 'published') {
      return { success: false, message: 'Opportunity is no longer active' };
    }

    // Cutoff check
    const oppDateStr = opp.date;
    const nowStr = new Date().toISOString().split('T')[0];
    if (nowStr > oppDateStr) {
      return { success: false, message: 'Registration has closed for past opportunities.' };
    }

    // Age calculation on event date!
    const user = this.currentUser?.id === volunteerId ? this.currentUser : null;
    if (user && user.dob) {
      const dobYear = new Date(user.dob).getFullYear();
      const oppYear = new Date(opp.date).getFullYear();
      const ageOnEvent = oppYear - dobYear;

      if (opp.min_age !== null && opp.min_age !== undefined && ageOnEvent < opp.min_age) {
        return {
          success: false,
          message: `Age requirement not met. Minimum age for this event date is ${opp.min_age} (Your age on event date: ${ageOnEvent}).`,
        };
      }
      if (opp.max_age !== null && opp.max_age !== undefined && ageOnEvent > opp.max_age) {
        return {
          success: false,
          message: `Age requirement not met. Maximum age for this event date is ${opp.max_age}.`,
        };
      }
    }

    // Atomic Capacity Check
    const currentActiveRegs = this.registrations.filter(
      (r) => r.opportunity_id === opportunityId && r.status === 'registered'
    ).length;

    if (opp.max_volunteers !== null && opp.max_volunteers !== undefined && currentActiveRegs >= opp.max_volunteers) {
      return { success: false, message: 'This opportunity is full.' };
    }

    // Check existing registration
    const existing = this.registrations.find(
      (r) => r.opportunity_id === opportunityId && r.volunteer_id === volunteerId
    );

    if (existing) {
      if (existing.status === 'registered') {
        return { success: true, message: 'You are already registered.' };
      }
      existing.status = 'registered';
      existing.registered_at = new Date().toISOString();
    } else {
      this.registrations.push({
        id: 'reg-' + Date.now(),
        opportunity_id: opportunityId,
        volunteer_id: volunteerId,
        registered_at: new Date().toISOString(),
        status: 'registered',
      });
    }

    // In-app Notification for Volunteer
    this.addNotification({
      user_id: volunteerId,
      title: 'Registration Confirmed',
      message: `You are confirmed for "${opp.title}" on ${opp.date}.`,
      type: 'registration_confirmed',
      link: '/dashboard',
    });

    // In-app Notification for Organizer
    this.addNotification({
      user_id: opp.org_id,
      title: 'New Volunteer Sign-Up',
      message: `${user?.name || 'A volunteer'} registered for "${opp.title}".`,
      type: 'volunteer_signed_up',
      link: '/organizer',
    });

    // Capacity notification to organizer if full
    if (opp.max_volunteers && currentActiveRegs + 1 >= opp.max_volunteers) {
      this.addNotification({
        user_id: opp.org_id,
        title: 'Opportunity Full',
        message: `"${opp.title}" has reached its maximum volunteer capacity (${opp.max_volunteers}).`,
        type: 'capacity_reached',
        link: '/organizer',
      });
    }

    this.saveToStorage();
    return { success: true, message: 'Registration confirmed!' };
  }

  public unsignFromOpportunity(opportunityId: string, volunteerId: string): { success: boolean; message: string } {
    const opp = this.opportunities.find((o) => o.id === opportunityId);
    const reg = this.registrations.find(
      (r) => r.opportunity_id === opportunityId && r.volunteer_id === volunteerId && r.status === 'registered'
    );

    if (!reg) return { success: false, message: 'Registration not found' };

    // Unsigning cutoff check: before opportunity start date
    const oppDateStr = opp?.date || '';
    const nowStr = new Date().toISOString().split('T')[0];
    if (nowStr > oppDateStr) {
      return { success: false, message: 'Cannot unsign after event start time.' };
    }

    reg.status = 'unsigned';

    // Notify organizer
    if (opp) {
      this.addNotification({
        user_id: opp.org_id,
        title: 'Volunteer Unsigned',
        message: `${this.currentUser?.name || 'A volunteer'} unsigned from "${opp.title}". A spot is now available.`,
        type: 'volunteer_unsigned',
        link: '/organizer',
      });
    }

    this.saveToStorage();
    return { success: true, message: 'You have unsigned from this opportunity.' };
  }

  public getVolunteerRegistrations(volunteerId: string): Registration[] {
    return this.registrations.filter((r) => r.volunteer_id === volunteerId && r.status === 'registered');
  }

  // --- Attendance & Hours Logic ---
  public getAttendanceForOpportunity(opportunityId: string): AttendanceRecord[] {
    return this.attendance.filter((a) => a.opportunity_id === opportunityId);
  }

  public markAttendance(
    opportunityId: string,
    volunteerId: string,
    status: 'here' | 'not_here'
  ): AttendanceRecord {
    const opp = this.opportunities.find((o) => o.id === opportunityId);
    const org = this.organizers.find((o) => o.id === opp?.org_id);
    const isVerified = org?.verification_status === 'verified';

    // Hours logic rule:
    // If Verified Org & status == 'here' -> hours_awarded = opp.duration_hours
    // If Pending or Revoked Org -> hours_awarded = 0!
    const hoursAwarded = status === 'here' && isVerified ? opp?.duration_hours || 0 : 0;

    let att = this.attendance.find((a) => a.opportunity_id === opportunityId && a.volunteer_id === volunteerId);

    if (att) {
      att.status = status;
      att.hours_awarded = hoursAwarded;
      att.is_verified_org_at_completion = isVerified;
      att.marked_at = new Date().toISOString();
    } else {
      att = {
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        opportunity_id: opportunityId,
        volunteer_id: volunteerId,
        status,
        hours_awarded: hoursAwarded,
        is_verified_org_at_completion: isVerified,
        marked_at: new Date().toISOString(),
      };
      this.attendance.push(att);
    }

    // Check badge level up notification for volunteer
    if (status === 'here' && hoursAwarded > 0) {
      const prevTotal = this.calculateVolunteerTotalHours(volunteerId) - hoursAwarded;
      const newTotal = this.calculateVolunteerTotalHours(volunteerId);
      const prevBadge = getBadgeForHours(prevTotal);
      const newBadge = getBadgeForHours(newTotal);

      if (newBadge.order_index > prevBadge.order_index) {
        this.addNotification({
          user_id: volunteerId,
          title: 'New Badge Unlocked! 🏆',
          message: `Congratulations! You earned the "${newBadge.name}" badge for reaching ${newBadge.min_hours}+ volunteer hours!`,
          type: 'badge_earned',
          link: '/dashboard',
        });
      }
    }

    this.saveToStorage();
    return att;
  }

  public endEvent(opportunityId: string) {
    const opp = this.opportunities.find((o) => o.id === opportunityId);
    if (!opp) return;

    opp.status = 'ended';

    // Auto-mark any unmarked registrations as 'not_here'
    const regs = this.registrations.filter((r) => r.opportunity_id === opportunityId && r.status === 'registered');

    regs.forEach((reg) => {
      const existing = this.attendance.find(
        (a) => a.opportunity_id === opportunityId && a.volunteer_id === reg.volunteer_id
      );

      if (!existing || existing.status === 'unmarked') {
        this.markAttendance(opportunityId, reg.volunteer_id, 'not_here');
      }
    });

    this.saveToStorage();
  }

  // Derived Totals & Reports
  public calculateVolunteerTotalHours(volunteerId: string): number {
    return this.attendance
      .filter((a) => a.volunteer_id === volunteerId && a.status === 'here')
      .reduce((sum, a) => sum + (a.hours_awarded || 0), 0);
  }

  public calculateVolunteerCompletedShifts(volunteerId: string): number {
    // Specification Rule: Completed Shifts counts EVERY shift where marked 'Here' (Verified OR Pending!)
    return this.attendance.filter((a) => a.volunteer_id === volunteerId && a.status === 'here').length;
  }

  // --- Saved Opportunities ---
  public toggleSavedOpportunity(volunteerId: string, opportunityId: string): boolean {
    const index = this.savedOpportunityIds.indexOf(opportunityId);
    let isSaved = false;
    if (index >= 0) {
      this.savedOpportunityIds.splice(index, 1);
      isSaved = false;
    } else {
      this.savedOpportunityIds.push(opportunityId);
      isSaved = true;
    }
    this.saveToStorage();
    return isSaved;
  }

  public getSavedOpportunityIds(): string[] {
    return this.savedOpportunityIds;
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>) {
    const notif: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    this.saveToStorage();
  }

  public markNotificationRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) {
      n.is_read = true;
      this.saveToStorage();
    }
  }

  public markAllNotificationsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.saveToStorage();
  }

  // --- Admin Portal Hours Editor & Audit Log ---
  public adminEditShiftHours(
    attendanceId: string,
    newHours: number,
    adminId: string,
    reason?: string
  ): { success: boolean; message: string } {
    const att = this.attendance.find((a) => a.id === attendanceId);
    if (!att) return { success: false, message: 'Attendance record not found' };

    const originalHours = att.hours_awarded;
    att.hours_awarded = newHours;

    // Create mandatory Audit Log record
    const auditLog: HourAuditLog = {
      id: 'audit-' + Date.now(),
      attendance_id: attendanceId,
      volunteer_id: att.volunteer_id,
      opportunity_id: att.opportunity_id,
      original_hours: originalHours,
      new_hours: newHours,
      edited_by: adminId,
      reason: reason || 'Krow Admin hour correction',
      created_at: new Date().toISOString(),
    };

    this.hourAuditLogs.unshift(auditLog);

    // Notify volunteer of admin hour edit
    this.addNotification({
      user_id: att.volunteer_id,
      title: 'Volunteer Hours Adjusted',
      message: `Krow Admin adjusted your shift hours from ${originalHours}h to ${newHours}h.`,
      type: 'admin_hours_edited',
      link: '/dashboard',
    });

    this.saveToStorage();
    return { success: true, message: 'Shift hours updated successfully and audit log saved.' };
  }

  public getHourAuditLogs(): HourAuditLog[] {
    return this.hourAuditLogs;
  }

  public getAllAttendanceRecords(): AttendanceRecord[] {
    return this.attendance;
  }
}

export const db = new LocalDatabase();
