import {
  SystemRole,
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
import { supabase, isSupabaseConfigured } from './supabase';

// Predefined Specification Categories (Spec #23 & #102)
const INITIAL_CATEGORIES: Category[] = [
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

export function ensureUUID(id?: string): string {
  if (!id) return '00000000-0000-4000-8000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex.slice(0, 12)}`;
}

// Clean Launch Ready State (Zero Fake Mocks)
class LocalDatabase {
  private categories: Category[] = INITIAL_CATEGORIES;
  private organizers: OrganizerProfile[] = [];
  private opportunities: Opportunity[] = [];
  private currentUser: UserProfile | null = null;
  private profiles: UserProfile[] = [];
  private registrations: Registration[] = [];
  private attendance: AttendanceRecord[] = [];
  private notifications: NotificationItem[] = [];
  private savedOpportunityIds: string[] = [];
  private hourAuditLogs: HourAuditLog[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.initSupabaseAuthListener();
      this.syncWithSupabase();
    }
  }

  private initSupabaseAuthListener() {
    if (!isSupabaseConfigured()) return;
    try {
      const processSession = (session: any) => {
        if (!session?.user) return;
        const rawMeta = session.user.user_metadata || {};
        const fullName = rawMeta.full_name || rawMeta.name || session.user.email?.split('@')[0] || 'Volunteer';
        const avatarUrl = rawMeta.avatar_url || rawMeta.picture || null;

        const user: UserProfile = {
          id: session.user.id,
          email: session.user.email || 'volunteer@gmail.com',
          role: (rawMeta.role as SystemRole) || 'volunteer',
          name: fullName,
          avatar_url: avatarUrl,
          country: 'Canada',
          province_state: 'BC',
          city: 'Vancouver',
          created_at: new Date().toISOString(),
        };

        this.setCurrentUser(user);

        // Clean ugly OAuth token hash fragment from browser URL bar
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) processSession(session);
      });

      supabase.auth.onAuthStateChange((event, session) => {
        if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          processSession(session);
        }
      });
    } catch (e) {
      console.error('Supabase auth listener error:', e);
    }
  }

  public async syncWithSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      // 1. Sync Profiles
      const { data: dbProfiles } = await supabase.from('profiles').select('*');
      if (dbProfiles && dbProfiles.length > 0) {
        dbProfiles.forEach((p: any) => {
          const idx = this.profiles.findIndex((existing) => existing.id === p.id);
          const mappedProfile: UserProfile = {
            id: p.id,
            role: p.role || 'volunteer',
            email: p.email || '',
            name: p.name || 'Volunteer',
            dob: p.dob || undefined,
            country: p.country || 'Canada',
            province_state: p.province_state || 'BC',
            city: p.city || 'Vancouver',
            bio: p.bio || undefined,
            avatar_url: p.avatar_url || undefined,
            created_at: p.created_at || new Date().toISOString(),
          };
          if (idx >= 0) {
            this.profiles[idx] = mappedProfile;
          } else {
            this.profiles.push(mappedProfile);
          }
        });
      }

      // 2. Sync Registrations
      const { data: dbRegs } = await supabase.from('registrations').select('*');
      if (dbRegs && dbRegs.length > 0) {
        dbRegs.forEach((r: any) => {
          const idx = this.registrations.findIndex((existing) => existing.id === r.id);
          const mappedReg: Registration = {
            id: r.id,
            opportunity_id: r.opportunity_id,
            volunteer_id: r.volunteer_id,
            registered_at: r.registered_at || new Date().toISOString(),
            status: r.status || 'registered',
          };
          if (idx >= 0) {
            this.registrations[idx] = mappedReg;
          } else {
            this.registrations.push(mappedReg);
          }
        });
      }

      // 3. Sync Opportunities
      const { data: dbOpps } = await supabase.from('opportunities').select('*');
      if (dbOpps) {
        const mappedOpps: Opportunity[] = dbOpps.map((sOpp: any) => ({
          id: sOpp.id,
          org_id: sOpp.org_id,
          org_name: sOpp.org_name || 'Organization',
          org_verification_status: 'verified',
          title: sOpp.title,
          description: sOpp.description,
          instructions: sOpp.instructions,
          category_id: sOpp.category_id || 'community',
          banner_url: sOpp.banner_url,
          date: sOpp.date,
          start_time: sOpp.start_time,
          end_time: sOpp.end_time,
          duration_hours: sOpp.duration_hours || 2,
          location_type: sOpp.location_type || 'physical',
          location_address: sOpp.location_address,
          min_age: sOpp.min_age,
          max_age: sOpp.max_age,
          max_volunteers: sOpp.max_volunteers,
          status: sOpp.status || 'published',
          created_at: sOpp.created_at || new Date().toISOString(),
        }));
        this.opportunities = mappedOpps;
      }

      // 4. Update dynamic registered_count on all opportunities
      this.opportunities.forEach((opp) => {
        opp.registered_count = this.getRegisteredCount(opp.id);
      });

      // 5. Sync Organizers
      const { data: dbOrgs } = await supabase.from('organizer_profiles').select('*');
      if (dbOrgs && dbOrgs.length > 0) {
        dbOrgs.forEach((sOrg: any) => {
          const idx = this.organizers.findIndex((o) => o.id === sOrg.id);
          const mappedOrg: OrganizerProfile = {
            id: sOrg.id,
            org_name: sOrg.org_name,
            hq_country: sOrg.hq_country || 'Canada',
            hq_province_state: sOrg.hq_province_state || 'BC',
            hq_city: sOrg.hq_city || 'Vancouver',
            hq_address: sOrg.hq_address,
            no_hq: sOrg.no_hq || false,
            bio: sOrg.bio,
            logo_url: sOrg.logo_url,
            verification_status: sOrg.verification_status || 'verified',
            created_at: sOrg.created_at || new Date().toISOString(),
          };
          if (idx >= 0) {
            this.organizers[idx] = { ...this.organizers[idx], ...mappedOrg };
          } else {
            this.organizers.push(mappedOrg);
          }
        });
      }
      this.saveToStorage();
    } catch (e) {
      console.error('Supabase sync error:', e);
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
      // Force purge stale local storage if legacy mock keys exist
      const cacheVer = localStorage.getItem('krow_cache_v4_clean');
      if (!cacheVer) {
        localStorage.clear();
        localStorage.setItem('krow_cache_v4_clean', 'true');
        return;
      }

      const storedCategories = localStorage.getItem('krow_categories');
      if (storedCategories) this.categories = JSON.parse(storedCategories);

      const storedOrganizers = localStorage.getItem('krow_organizers');
      if (storedOrganizers) {
        const parsed = JSON.parse(storedOrganizers);
        this.organizers = parsed.filter((o: any) => !['org-krow', 'org-1', 'org-2'].includes(o.id));
      }

      const storedOpps = localStorage.getItem('krow_opportunities');
      if (storedOpps) {
        const parsed = JSON.parse(storedOpps);
        this.opportunities = parsed.filter((o: any) => !o.id.startsWith('opp-krow-'));
      }

      const storedUser = localStorage.getItem('krow_currentUser');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id === 'vol-1' || parsed?.name === 'Alex Chen') {
          this.currentUser = null;
        } else {
          this.currentUser = parsed;
        }
      }

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
    if (user) {
      user.id = ensureUUID(user.id);
    }
    this.currentUser = user;
    this.saveToStorage();

    if (user && isSupabaseConfigured()) {
      supabase
        .from('profiles')
        .upsert([
          {
            id: user.id,
            role: user.role,
            email: user.email,
            name: user.name,
            dob: user.dob || null,
            country: user.country || 'Canada',
            province_state: user.province_state || 'BC',
            city: user.city || 'Vancouver',
            bio: user.bio || null,
            avatar_url: user.avatar_url || null,
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Supabase profile upsert error:', error);
        });

      if (user.role === 'organizer') {
        const existingOrg = this.getOrganizer(user.id);
        const orgToSave: OrganizerProfile = existingOrg || {
          id: user.id,
          org_name: user.name,
          hq_country: user.country || 'Canada',
          hq_province_state: user.province_state || 'BC',
          hq_city: user.city || 'Vancouver',
          no_hq: false,
          verification_status: 'verified',
          created_at: new Date().toISOString(),
        };
        this.saveOrganizer(orgToSave);
      }
    }
  }

  public updateProfile(updates: Partial<UserProfile>) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...updates };
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      supabase
        .from('profiles')
        .update({
          name: updates.name,
          dob: updates.dob,
          country: updates.country,
          province_state: updates.province_state,
          city: updates.city,
          bio: updates.bio,
          avatar_url: updates.avatar_url,
        })
        .eq('id', this.currentUser.id)
        .then(({ error }) => {
          if (error) console.error('Supabase profile update error:', error);
        });
    }
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

    org.verification_status = status;

    // Update opportunities org_verification_status
    this.opportunities.forEach((opp) => {
      if (opp.org_id === orgId) {
        opp.org_verification_status = status;
      }
    });

    // In-app notification for Organizer
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

  public async deleteOrganizer(orgId: string): Promise<void> {
    this.organizers = this.organizers.filter((o) => o.id !== orgId);
    this.opportunities = this.opportunities.filter((o) => o.org_id !== orgId);
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('organizer_profiles').delete().eq('id', orgId);
        await supabase.from('profiles').delete().eq('id', orgId);
        await supabase.from('opportunities').delete().eq('org_id', orgId);
      } catch (err) {
        console.error('Supabase delete organizer error:', err);
      }
    }
  }

  public async deleteAccount(userId: string): Promise<void> {
    if (this.currentUser?.id === userId) {
      this.currentUser = null;
    }
    this.organizers = this.organizers.filter((o) => o.id !== userId);
    this.opportunities = this.opportunities.filter((o) => o.org_id !== userId);
    this.registrations = this.registrations.filter((r) => r.volunteer_id !== userId);
    this.attendance = this.attendance.filter((a) => a.volunteer_id !== userId);
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('organizer_profiles').delete().eq('id', userId);
        await supabase.from('profiles').delete().eq('id', userId);
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase account delete error:', err);
      }
    }
  }

  public saveOrganizer(org: OrganizerProfile) {
    const orgId = ensureUUID(org.id);
    org.id = orgId;

    const index = this.organizers.findIndex((o) => o.id === org.id);
    if (index >= 0) {
      this.organizers[index] = { ...this.organizers[index], ...org };
    } else {
      this.organizers.push(org);
    }

    // Update opportunities matching this org_id so org_name stays in sync!
    this.opportunities.forEach((opp) => {
      if (opp.org_id === org.id) {
        opp.org_name = org.org_name;
        opp.org_logo_url = org.logo_url;
      }
    });

    this.saveToStorage();

    if (isSupabaseConfigured()) {
      // 1. Ensure parent profile row exists in Supabase
      supabase
        .from('profiles')
        .upsert([
          {
            id: orgId,
            role: 'organizer',
            email: this.currentUser?.email || `${org.org_name.toLowerCase().replace(/\s+/g, '')}@org.com`,
            name: org.org_name,
            country: org.hq_country || 'Canada',
            province_state: org.hq_province_state || 'BC',
            city: org.hq_city || 'Vancouver',
          },
        ])
        .then(({ error: pErr }) => {
          if (pErr) console.error('Supabase profile upsert for org error:', pErr);
          // 2. Upsert organizer profile row
          supabase
            .from('organizer_profiles')
            .upsert([
              {
                id: orgId,
                org_name: org.org_name,
                hq_country: org.hq_country || 'Canada',
                hq_province_state: org.hq_province_state || 'BC',
                hq_city: org.hq_city || 'Vancouver',
                hq_address: org.hq_address || null,
                no_hq: org.no_hq || false,
                bio: org.bio || null,
                logo_url: org.logo_url || null,
                verification_status: org.verification_status || 'verified',
              },
            ])
            .then(({ error: oErr }) => {
              if (oErr) console.error('Supabase organizer upsert error:', oErr);
            });
        });
    }
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

  public createOpportunity(oppData: Omit<Opportunity, 'id' | 'created_at' | 'status'> & Partial<Opportunity>): Opportunity {
    const oppId = ensureUUID('opp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4));
    const rawOrgId = oppData.org_id || this.currentUser?.id || 'org-krow';
    const orgId = ensureUUID(rawOrgId);

    let org = this.organizers.find((o) => o.id === orgId);
    if (!org) {
      org = {
        id: orgId,
        org_name: oppData.org_name || 'Organization',
        verification_status: oppData.org_verification_status || 'verified',
        no_hq: false,
        created_at: new Date().toISOString(),
      };
      this.organizers.push(org);
    }

    const newOpp: Opportunity = {
      ...oppData,
      id: oppId,
      org_id: orgId,
      org_name: oppData.org_name || org?.org_name || 'Organization',
      org_verification_status: oppData.org_verification_status || org?.verification_status || 'verified',
      org_logo_url: oppData.org_logo_url || org?.logo_url || undefined,
      status: 'published',
      registered_count: 0,
      created_at: new Date().toISOString(),
    };

    this.opportunities.unshift(newOpp);
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      // Ensure parent profile & organizer profile rows exist before inserting opportunity into Supabase
      supabase
        .from('profiles')
        .upsert([
          {
            id: orgId,
            role: 'organizer',
            email: `${(newOpp.org_name || 'org').toLowerCase().replace(/\s+/g, '')}@org.com`,
            name: newOpp.org_name || 'Organization',
          },
        ])
        .then(() => {
          supabase
            .from('organizer_profiles')
            .upsert([
              {
                id: orgId,
                org_name: newOpp.org_name || 'Organization',
                verification_status: 'verified',
              },
            ])
            .then(() => {
              supabase
                .from('opportunities')
                .upsert([
                  {
                    id: oppId,
                    org_id: orgId,
                    title: newOpp.title,
                    description: newOpp.description || null,
                    instructions: newOpp.instructions || null,
                    category_id: newOpp.category_id || 'community',
                    banner_url: newOpp.banner_url || null,
                    date: newOpp.date,
                    start_time: newOpp.start_time,
                    end_time: newOpp.end_time,
                    duration_hours: newOpp.duration_hours || 2,
                    location_type: newOpp.location_type || 'physical',
                    location_address: newOpp.location_address || null,
                    min_age: newOpp.min_age || null,
                    max_age: newOpp.max_age || null,
                    max_volunteers: newOpp.max_volunteers || null,
                    status: newOpp.status || 'published',
                  },
                ])
                .then(({ error: oppErr }) => {
                  if (oppErr) console.error('Supabase opportunity upsert error:', oppErr);
                });
            });
        });
    }

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

  public async deleteOpportunity(id: string): Promise<void> {
    const oppUUID = ensureUUID(id);

    this.opportunities = this.opportunities.filter((o) => o.id !== id && o.id !== oppUUID);
    this.registrations = this.registrations.filter((r) => r.opportunity_id !== id && r.opportunity_id !== oppUUID);
    this.attendance = this.attendance.filter((a) => a.opportunity_id !== id && a.opportunity_id !== oppUUID);
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('registrations').delete().or(`opportunity_id.eq.${id},opportunity_id.eq.${oppUUID}`);
        await supabase.from('attendance').delete().or(`opportunity_id.eq.${id},opportunity_id.eq.${oppUUID}`);
        const { error } = await supabase.from('opportunities').delete().or(`id.eq.${id},id.eq.${oppUUID}`);
        if (error) {
          console.error('Supabase opportunity delete error:', error);
        }
      } catch (err) {
        console.error('Supabase opportunity delete exception:', err);
      }
    }
  }

  public async clearPastOpportunities(orgId: string): Promise<void> {
    const orgUUID = ensureUUID(orgId);
    const todayStr = new Date().toISOString().split('T')[0];
    const pastOppIds = new Set(
      this.opportunities
        .filter((o) => (o.org_id === orgId || o.org_id === orgUUID) && (o.status === 'ended' || o.status === 'cancelled' || o.date < todayStr))
        .map((o) => o.id)
    );

    this.opportunities = this.opportunities.filter((o) => !pastOppIds.has(o.id));
    this.registrations = this.registrations.filter((r) => !pastOppIds.has(r.opportunity_id));
    this.attendance = this.attendance.filter((a) => !pastOppIds.has(a.opportunity_id));
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        for (const oppId of Array.from(pastOppIds)) {
          const oppUUID = ensureUUID(oppId);
          await supabase.from('registrations').delete().or(`opportunity_id.eq.${oppId},opportunity_id.eq.${oppUUID}`);
          await supabase.from('attendance').delete().or(`opportunity_id.eq.${oppId},opportunity_id.eq.${oppUUID}`);
          await supabase.from('opportunities').delete().or(`id.eq.${oppId},id.eq.${oppUUID}`);
        }
        await supabase.from('opportunities').delete().or(`org_id.eq.${orgId},org_id.eq.${orgUUID}`).in('status', ['ended', 'cancelled']);
      } catch (err) {
        console.error('Supabase clear past opportunities error:', err);
      }
    }
  }

  // --- Profile Lookup Helpers ---
  public getProfile(userId: string): UserProfile | null {
    if (this.currentUser?.id === userId) return this.currentUser;
    return this.profiles.find((p) => p.id === userId) || null;
  }

  // --- Registration Logic ---
  public getRegisteredCount(opportunityId: string): number {
    return this.registrations.filter(
      (r) => r.opportunity_id === opportunityId && r.status === 'registered'
    ).length;
  }

  public getRegistrationsForOpportunity(opportunityId: string): Registration[] {
    return this.registrations.filter(
      (r) => r.opportunity_id === opportunityId && r.status === 'registered'
    );
  }

  public getRegistrationsForVolunteer(volunteerId: string): Registration[] {
    return this.registrations.filter(
      (r) => r.volunteer_id === volunteerId && r.status === 'registered'
    );
  }

  public getVolunteerRegistrations(id: string): Registration[] {
    return this.registrations.filter(
      (r) => (r.opportunity_id === id || r.volunteer_id === id) && r.status === 'registered'
    );
  }

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

    // Age calculation on event date
    const user = this.getProfile(volunteerId);
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

    // Capacity Check
    const currentActiveRegs = this.getRegisteredCount(opportunityId);

    if (opp.max_volunteers !== null && opp.max_volunteers !== undefined && currentActiveRegs >= opp.max_volunteers) {
      return { success: false, message: 'This opportunity is full.' };
    }

    let regId = 'reg-' + Date.now();
    const existing = this.registrations.find(
      (r) => r.opportunity_id === opportunityId && r.volunteer_id === volunteerId
    );

    if (existing) {
      if (existing.status === 'registered') {
        return { success: true, message: 'You are already registered.' };
      }
      existing.status = 'registered';
      existing.registered_at = new Date().toISOString();
      regId = existing.id;
    } else {
      this.registrations.push({
        id: regId,
        opportunity_id: opportunityId,
        volunteer_id: volunteerId,
        registered_at: new Date().toISOString(),
        status: 'registered',
      });
    }

    // Update dynamic registered_count on opportunity
    opp.registered_count = this.getRegisteredCount(opportunityId);

    // Volunteer Notification
    this.addNotification({
      user_id: volunteerId,
      title: 'Registration Confirmed',
      message: `You are confirmed for "${opp.title}" on ${opp.date}.`,
      type: 'registration_confirmed',
      link: '/dashboard',
    });

    // Organizer Notification
    this.addNotification({
      user_id: opp.org_id,
      title: 'New Volunteer Sign-Up',
      message: `${user?.name || 'A volunteer'} registered for "${opp.title}".`,
      type: 'volunteer_signed_up',
      link: '/organizer',
    });

    this.saveToStorage();

    // Sync Registration to Supabase PostgreSQL
    if (isSupabaseConfigured()) {
      const regUUID = ensureUUID(regId);
      const oppUUID = ensureUUID(opportunityId);
      const volUUID = ensureUUID(volunteerId);

      supabase
        .from('registrations')
        .upsert([
          {
            id: regUUID,
            opportunity_id: oppUUID,
            volunteer_id: volUUID,
            status: 'registered',
            registered_at: new Date().toISOString(),
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Supabase registration upsert error:', error);
        });
    }

    return { success: true, message: 'Registration confirmed!' };
  }

  public unsignFromOpportunity(opportunityId: string, volunteerId: string): { success: boolean; message: string } {
    const opp = this.opportunities.find((o) => o.id === opportunityId);
    const reg = this.registrations.find(
      (r) => r.opportunity_id === opportunityId && r.volunteer_id === volunteerId && r.status === 'registered'
    );

    if (!reg) return { success: false, message: 'Registration not found' };

    const oppDateStr = opp?.date || '';
    const nowStr = new Date().toISOString().split('T')[0];
    if (nowStr > oppDateStr) {
      return { success: false, message: 'Cannot unsign after event start time.' };
    }

    reg.status = 'unsigned';

    if (opp) {
      opp.registered_count = this.getRegisteredCount(opportunityId);
      this.addNotification({
        user_id: opp.org_id,
        title: 'Volunteer Unsigned',
        message: `${this.currentUser?.name || 'A volunteer'} unsigned from "${opp.title}". A spot is now available.`,
        type: 'volunteer_unsigned',
        link: '/organizer',
      });
    }

    this.saveToStorage();

    // Sync Unsign to Supabase PostgreSQL
    if (isSupabaseConfigured()) {
      const regUUID = ensureUUID(reg.id);
      supabase
        .from('registrations')
        .update({ status: 'unsigned' })
        .eq('id', regUUID)
        .then(({ error }) => {
          if (error) console.error('Supabase unsign error:', error);
        });
    }

    return { success: true, message: 'You have unsigned from this opportunity.' };
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

  public calculateVolunteerTotalHours(volunteerId: string): number {
    return this.attendance
      .filter((a) => a.volunteer_id === volunteerId && a.status === 'here')
      .reduce((sum, a) => sum + (a.hours_awarded || 0), 0);
  }

  public calculateVolunteerCompletedShifts(volunteerId: string): number {
    return this.attendance.filter((a) => a.volunteer_id === volunteerId && a.status === 'here').length;
  }

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
