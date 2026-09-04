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
  ContactMessage,
  VerificationStatus,
  RecurrenceType,
  RecurrenceFrequency,
  CertificateRecord,
  CertificateStatus,
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

export function generateKrowId(existingIds: string[] = []): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const existingSet = new Set(existingIds.map((id) => id.toUpperCase()));
  let krowId = '';
  do {
    let rand = '';
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    krowId = `KROW-${rand}`;
  } while (existingSet.has(krowId));
  return krowId;
}

export function generateCertificateId(userKrowId?: string, existingIds: string[] = []): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const existingSet = new Set(existingIds.map((id) => id.toUpperCase()));
  let certId = '';
  const cleanKrow = userKrowId ? userKrowId.replace(/^KROW-/i, '').toUpperCase() : '';

  do {
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    certId = cleanKrow ? `CERT-${cleanKrow}-${rand}` : `CERT-${rand}${rand}`;
  } while (existingSet.has(certId));
  return certId;
}

export function parseKrowIdFromCertId(certId: string): string | null {
  if (!certId) return null;
  const clean = certId.trim().toUpperCase();
  const match = clean.match(/^CERT-([23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8})(-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4})?$/i);
  if (match && match[1]) {
    return `KROW-${match[1]}`;
  }
  return null;
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
  private contactMessages: ContactMessage[] = [];
  private certificates: CertificateRecord[] = [];
  private inflightRequests: Map<string, Promise<any>> = new Map();
  private lastSyncTimes: Map<string, number> = new Map();

  public ensureKrowId(profile: UserProfile): UserProfile {
    if (!profile.krow_id) {
      const existingKrowIds = this.profiles.map((p) => p.krow_id).filter(Boolean) as string[];
      profile.krow_id = generateKrowId(existingKrowIds);
    }
    return profile;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.initSupabaseAuthListener();
    }
  }

  private initSupabaseAuthListener() {
    if (!isSupabaseConfigured()) return;
    try {
      const processSession = async (session: any) => {
        if (!session?.user) return;

        // Skip auto-login if the user explicitly clicked Log Out
        if (typeof window !== 'undefined' && localStorage.getItem('krow_explicit_logged_out') === 'true') {
          return;
        }

        const uUUID = ensureUUID(session.user.id);
        const rawMeta = session.user.user_metadata || {};
        const fullName = rawMeta.full_name || rawMeta.name || session.user.email?.split('@')[0] || 'Volunteer';
        const avatarUrl = rawMeta.avatar_url || rawMeta.picture || null;

        const localCur = (this.currentUser && (this.currentUser.id === session.user.id || ensureUUID(this.currentUser.id) === uUUID)) ? this.currentUser : null;

        let existingRemoteProfile: UserProfile | null = null;
        try {
          const { data } = await supabase
            .from('profiles')
            .select('id, krow_id, role, email, name, dob, country, province_state, city, location_set, bio, avatar_url, created_at')
            .or(`id.eq.${session.user.id},id.eq.${uUUID}`)
            .single();
          if (data) {
            existingRemoteProfile = {
              id: data.id,
              krow_id: data.krow_id || localCur?.krow_id || undefined,
              role: data.role || (rawMeta.role as SystemRole) || localCur?.role || 'volunteer',
              email: data.email || session.user.email,
              name: data.name || localCur?.name || fullName,
              dob: data.dob || localCur?.dob || undefined,
              country: data.country || localCur?.country || 'Canada',
              province_state: data.province_state || localCur?.province_state || 'BC',
              city: data.city || localCur?.city || 'Vancouver',
              location_set: data.location_set ?? localCur?.location_set ?? true,
              bio: data.bio || localCur?.bio || undefined,
              avatar_url: data.avatar_url || avatarUrl || localCur?.avatar_url || undefined,
              created_at: data.created_at || new Date().toISOString(),
            };
          }
        } catch (e) {
          // Ignore fallback if table lookup fails
        }

        const user: UserProfile = existingRemoteProfile || {
          id: uUUID,
          email: session.user.email || 'volunteer@gmail.com',
          role: (rawMeta.role as SystemRole) || localCur?.role || 'volunteer',
          name: localCur?.name || fullName,
          avatar_url: avatarUrl || localCur?.avatar_url || undefined,
          dob: localCur?.dob || undefined,
          country: localCur?.country || 'Canada',
          province_state: localCur?.province_state || 'BC',
          city: localCur?.city || 'Vancouver',
          location_set: localCur?.location_set ?? true,
          created_at: new Date().toISOString(),
        };

        this.ensureKrowId(user);
        this.currentUser = user;
        this.saveToStorage();
        if (!existingRemoteProfile) {
          await this.saveProfileToSupabase(user);
        }

        // Clean ugly OAuth token hash or code query params from browser URL bar after successful login
        if (typeof window !== 'undefined') {
          if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      };

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) processSession(session);
      });

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('krow_currentUser');
            localStorage.setItem('krow_explicit_logged_out', 'true');
          }
        } else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('krow_explicit_logged_out');
          }
          processSession(session);
        }
      });
    } catch (e) {
      console.error('Supabase auth listener error:', e);
    }
  }

  private dedupe<T>(key: string, fn: () => Promise<T>, ttlMs: number = 30000, force?: boolean): Promise<T> {
    const now = Date.now();
    const last = this.lastSyncTimes.get(key) || 0;
    if (!force && now - last < ttlMs) {
      return Promise.resolve(null as unknown as T);
    }
    if (this.inflightRequests.has(key)) {
      return this.inflightRequests.get(key) as Promise<T>;
    }
    const promise = fn()
      .then((res) => {
        this.lastSyncTimes.set(key, Date.now());
        this.inflightRequests.delete(key);
        return res;
      })
      .catch((err) => {
        this.inflightRequests.delete(key);
        throw err;
      });
    this.inflightRequests.set(key, promise);
    return promise;
  }

  private mapOpportunitiesFromDb(dbOpps: any[]): Opportunity[] {
    const seriesChildCountMap = new Map<string, number>();
    const seriesChildDatesMap = new Map<string, string[]>();

    dbOpps.forEach((sOpp: any) => {
      if (sOpp.recurrence_series_id) {
        if (sOpp.occurrence_number !== undefined && sOpp.occurrence_number !== null) {
          const c = seriesChildCountMap.get(sOpp.recurrence_series_id) || 0;
          seriesChildCountMap.set(sOpp.recurrence_series_id, c + 1);
        }
        if (sOpp.date) {
          const dates = seriesChildDatesMap.get(sOpp.recurrence_series_id) || [];
          if (!dates.includes(sOpp.date)) {
            dates.push(sOpp.date);
            dates.sort();
            seriesChildDatesMap.set(sOpp.recurrence_series_id, dates);
          }
        }
      }
    });

    return dbOpps.map((sOpp: any) => {
      const joinedOrg = sOpp.organizer;
      if (joinedOrg && joinedOrg.id) {
        const existingIdx = this.organizers.findIndex((o) => o.id === joinedOrg.id || ensureUUID(o.id) === ensureUUID(joinedOrg.id));
        const mappedJoinedOrg: OrganizerProfile = {
          id: joinedOrg.id,
          org_name: joinedOrg.org_name,
          hq_country: 'Canada',
          hq_province_state: 'BC',
          hq_city: 'Vancouver',
          no_hq: false,
          verification_status: joinedOrg.verification_status || 'verified',
          logo_url: joinedOrg.logo_url,
          created_at: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          this.organizers[existingIdx] = { ...this.organizers[existingIdx], ...mappedJoinedOrg };
        } else {
          this.organizers.push(mappedJoinedOrg);
        }
      }

      const matchOrg = this.organizers.find((o) => o.id === sOpp.org_id || o.id === ensureUUID(sOpp.org_id));
      const resolvedOrgName =
        joinedOrg?.org_name ||
        (sOpp.org_name && sOpp.org_name !== 'Organization'
          ? sOpp.org_name
          : matchOrg?.org_name || this.currentUser?.name || 'Organization');

      const localMatch = this.opportunities.find((l) => l.id === sOpp.id);
      const computedCount = sOpp.recurrence_series_id ? (seriesChildCountMap.get(sOpp.recurrence_series_id) || seriesChildDatesMap.get(sOpp.recurrence_series_id)?.length || 0) : 0;
      const computedDates = sOpp.recurrence_series_id ? seriesChildDatesMap.get(sOpp.recurrence_series_id) : undefined;

      const computedStart = sOpp.series_start_date || (computedDates && computedDates.length > 0 ? computedDates[0] : sOpp.date);
      let computedEnd = sOpp.series_end_date || (computedDates && computedDates.length > 0 ? computedDates[computedDates.length - 1] : undefined);
      
      if (!computedEnd || (computedEnd === computedStart && (sOpp.recurrence_count || computedCount) > 1)) {
        const count = sOpp.recurrence_count || computedCount || 1;
        if (count > 1 && computedStart) {
          const parts = computedStart.split('-');
          if (parts.length === 3) {
            const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            const freq = sOpp.recurrence_frequency || 'every_week';
            if (freq === 'every_day') {
              d.setDate(d.getDate() + (count - 1));
            } else if (freq === 'every_other_week') {
              d.setDate(d.getDate() + (count - 1) * 14);
            } else if (freq === 'every_month') {
              d.setMonth(d.getMonth() + (count - 1));
            } else {
              d.setDate(d.getDate() + (count - 1) * 7);
            }
            const y = d.getFullYear();
            const m = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            computedEnd = `${y}-${m}-${day}`;
          }
        }
      }

      return {
        id: sOpp.id,
        org_id: sOpp.org_id,
        org_name: resolvedOrgName,
        org_verification_status: joinedOrg?.verification_status || sOpp.org_verification_status || matchOrg?.verification_status || 'verified',
        org_logo_url: joinedOrg?.logo_url || sOpp.org_logo_url || matchOrg?.logo_url || undefined,
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
        is_recurring: sOpp.is_recurring ?? localMatch?.is_recurring ?? false,
        recurrence_type: sOpp.recurrence_type || localMatch?.recurrence_type,
        recurrence_frequency: sOpp.recurrence_frequency || localMatch?.recurrence_frequency,
        recurrence_series_id: sOpp.recurrence_series_id || localMatch?.recurrence_series_id,
        recurrence_count: sOpp.recurrence_count || localMatch?.recurrence_count || (computedCount > 0 ? computedCount : undefined),
        occurrence_number: sOpp.occurrence_number ?? localMatch?.occurrence_number,
        occurrence_dates: sOpp.occurrence_dates || localMatch?.occurrence_dates || (computedDates && computedDates.length > 0 ? computedDates : undefined),
        series_start_date: computedStart,
        series_end_date: computedEnd || sOpp.date,
        total_series_hours: sOpp.total_series_hours || localMatch?.total_series_hours || (computedCount > 0 ? (sOpp.duration_hours || 2) * computedCount : undefined),
        status: sOpp.status || 'published',
        ended_at: sOpp.ended_at || undefined,
        created_at: sOpp.created_at || new Date().toISOString(),
      };
    });
  }

  // 1. Scoped Opportunities Sync (Feed & Directory)
  public async syncOpportunities(force?: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return;
    return this.dedupe('sync_opportunities', async () => {
      try {
        const { data: dbOpps, error } = await supabase
          .from('opportunities')
          .select('id, org_id, title, description, instructions, category_id, banner_url, date, start_time, end_time, duration_hours, location_type, location_address, min_age, max_age, max_volunteers, is_recurring, recurrence_type, recurrence_frequency, recurrence_series_id, recurrence_count, occurrence_number, occurrence_dates, series_start_date, series_end_date, total_series_hours, status, ended_at, created_at, organizer:organizer_profiles(id, org_name, logo_url, verification_status)')
          .order('date', { ascending: true })
          .limit(100);

        if (error) {
          const { data: fallbackOpps } = await supabase
            .from('opportunities')
            .select('id, org_id, title, description, instructions, category_id, banner_url, date, start_time, end_time, duration_hours, location_type, location_address, min_age, max_age, max_volunteers, is_recurring, recurrence_type, recurrence_frequency, recurrence_series_id, recurrence_count, occurrence_number, occurrence_dates, series_start_date, series_end_date, total_series_hours, status, ended_at, created_at')
            .order('date', { ascending: true })
            .limit(100);

          if (fallbackOpps) {
            this.opportunities = this.mapOpportunitiesFromDb(fallbackOpps);
            this.opportunities.forEach((opp) => {
              opp.registered_count = this.getRegisteredCount(opp.id);
            });
            this.saveToStorage();
          }
          return;
        }

        if (dbOpps) {
          this.opportunities = this.mapOpportunitiesFromDb(dbOpps);
          this.opportunities.forEach((opp) => {
            opp.registered_count = this.getRegisteredCount(opp.id);
          });
          this.saveToStorage();
        }
      } catch (e) {
        console.error('Opportunities sync error:', e);
      }
    }, 30000, force);
  }

  // 2. Scoped Organizers Directory Sync
  public async syncOrganizers(force?: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return;
    return this.dedupe('sync_organizers', async () => {
      try {
        const { data: dbOrgs } = await supabase
          .from('organizer_profiles')
          .select('id, org_name, hq_country, hq_province_state, hq_city, hq_address, no_hq, bio, logo_url, verification_status, created_at');

        if (dbOrgs) {
          // Reconcile this.organizers with Supabase (purges deleted orgs)
          const mappedOrgs: OrganizerProfile[] = dbOrgs.map((sOrg: any) => ({
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
          }));

          this.organizers = mappedOrgs;

          // Remove any local opportunities belonging to deleted organizations
          const activeOrgIds = new Set(this.organizers.map((o) => o.id));
          const activeOrgUUIDs = new Set(this.organizers.map((o) => ensureUUID(o.id)));
          this.opportunities = this.opportunities.filter(
            (opp) => activeOrgIds.has(opp.org_id) || activeOrgUUIDs.has(ensureUUID(opp.org_id))
          );

          this.saveToStorage();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'organizer_profiles' } }));
          }
        }
      } catch (e) {
        console.error('Organizers sync error:', e);
      }
    }, 45000, force);
  }

  // 3. Scoped Volunteer Data Sync (Only for current authenticated volunteer)
  public async syncVolunteerData(volunteerId: string, force?: boolean): Promise<void> {
    if (!isSupabaseConfigured() || !volunteerId) return;
    const vUUID = ensureUUID(volunteerId);
    return this.dedupe(`sync_vol_${vUUID}`, async () => {
      try {
        const [regsRes, attRes, certsRes] = await Promise.all([
          supabase
            .from('registrations')
            .select('id, opportunity_id, volunteer_id, registered_at, status')
            .or(`volunteer_id.eq.${volunteerId},volunteer_id.eq.${vUUID}`),
          supabase
            .from('attendance')
            .select('id, opportunity_id, opportunity_title, volunteer_id, status, hours_awarded, is_verified_org_at_completion, marked_at')
            .or(`volunteer_id.eq.${volunteerId},volunteer_id.eq.${vUUID}`),
          supabase
            .from('certificates')
            .select('id, certificate_id, user_id, krow_id, student_name, hours, activity_count, issued_at, status, created_at')
            .or(`user_id.eq.${volunteerId},user_id.eq.${vUUID}`),
        ]);

        if (regsRes.data) {
          const remoteRegs: Registration[] = regsRes.data.map((r: any) => ({
            id: r.id,
            opportunity_id: r.opportunity_id,
            volunteer_id: r.volunteer_id,
            registered_at: r.registered_at || new Date().toISOString(),
            status: r.status || 'registered',
          }));
          const otherRegs = this.registrations.filter((r) => r.volunteer_id !== volunteerId && ensureUUID(r.volunteer_id) !== vUUID);
          this.registrations = [...otherRegs, ...remoteRegs];
        }

        if (attRes.data) {
          const remoteAtt: AttendanceRecord[] = attRes.data.map((a: any) => {
            const opp = this.opportunities.find((o) => o.id === a.opportunity_id || o.id === ensureUUID(a.opportunity_id));
            return {
              id: a.id,
              opportunity_id: a.opportunity_id,
              opportunity_title: a.opportunity_title || opp?.title,
              volunteer_id: a.volunteer_id,
              status: a.status || 'unmarked',
              hours_awarded: a.hours_awarded || 0,
              is_verified_org_at_completion: a.is_verified_org_at_completion ?? true,
              marked_at: a.marked_at || new Date().toISOString(),
            };
          });
          const otherAtt = this.attendance.filter((a) => a.volunteer_id !== volunteerId && ensureUUID(a.volunteer_id) !== vUUID);
          this.attendance = [...otherAtt, ...remoteAtt];
        }

        if (certsRes.data) {
          const remoteCerts: CertificateRecord[] = certsRes.data.map((c: any) => ({
            id: c.id,
            certificate_id: c.certificate_id,
            user_id: c.user_id,
            krow_id: c.krow_id,
            student_name: c.student_name || 'Volunteer',
            hours: c.hours || 0,
            activity_count: c.activity_count || 0,
            issued_at: c.issued_at || new Date().toISOString(),
            status: c.status || 'VALID',
            created_at: c.created_at || new Date().toISOString(),
          }));
          const otherCerts = this.certificates.filter((c) => c.user_id !== volunteerId && ensureUUID(c.user_id) !== vUUID);
          this.certificates = [...otherCerts, ...remoteCerts];
        }

        this.saveToStorage();
      } catch (e) {
        console.error('Volunteer data sync error:', e);
      }
    }, 15000, force);
  }

  // 4. Scoped Organizer Data Sync (Only for organizer's own opportunities & applicants)
  public async syncOrganizerData(orgId: string, force?: boolean): Promise<void> {
    if (!isSupabaseConfigured() || !orgId) return;
    const oUUID = ensureUUID(orgId);
    return this.dedupe(`sync_org_${oUUID}`, async () => {
      try {
        const [orgRes, oppsRes] = await Promise.all([
          supabase
            .from('organizer_profiles')
            .select('id, org_name, hq_country, hq_province_state, hq_city, hq_address, no_hq, bio, logo_url, verification_status, created_at')
            .eq('id', oUUID)
            .maybeSingle(),
          supabase
            .from('opportunities')
            .select('id, org_id, title, description, instructions, category_id, banner_url, date, start_time, end_time, duration_hours, location_type, location_address, min_age, max_age, max_volunteers, is_recurring, recurrence_type, recurrence_frequency, recurrence_series_id, recurrence_count, occurrence_number, occurrence_dates, series_start_date, series_end_date, total_series_hours, status, ended_at, created_at')
            .eq('org_id', oUUID),
        ]);

        if (orgRes.data) {
          const sOrg = orgRes.data;
          const idx = this.organizers.findIndex((o) => o.id === sOrg.id || ensureUUID(o.id) === oUUID);
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
          if (idx >= 0) this.organizers[idx] = { ...this.organizers[idx], ...mappedOrg };
          else this.organizers.push(mappedOrg);

          if (this.currentUser && (this.currentUser.id === sOrg.id || ensureUUID(this.currentUser.id) === oUUID)) {
            this.currentUser.avatar_url = sOrg.logo_url || this.currentUser.avatar_url;
            this.currentUser.name = sOrg.org_name || this.currentUser.name;
          }
        }

        if (oppsRes.data && oppsRes.data.length > 0) {
          const myOpps = this.mapOpportunitiesFromDb(oppsRes.data);
          const myOppIds = myOpps.map((o) => o.id);

          const otherOpps = this.opportunities.filter((o) => o.org_id !== orgId && ensureUUID(o.org_id) !== oUUID);
          this.opportunities = [...otherOpps, ...myOpps];

          const [regsRes, attRes] = await Promise.all([
            supabase
              .from('registrations')
              .select('id, opportunity_id, volunteer_id, registered_at, status')
              .in('opportunity_id', myOppIds),
            supabase
              .from('attendance')
              .select('id, opportunity_id, opportunity_title, volunteer_id, status, hours_awarded, is_verified_org_at_completion, marked_at')
              .in('opportunity_id', myOppIds),
          ]);

          if (regsRes.data) {
            const orgRegs: Registration[] = regsRes.data.map((r: any) => ({
              id: r.id,
              opportunity_id: r.opportunity_id,
              volunteer_id: r.volunteer_id,
              registered_at: r.registered_at || new Date().toISOString(),
              status: r.status || 'registered',
            }));
            const otherRegs = this.registrations.filter((r) => !myOppIds.includes(r.opportunity_id));
            this.registrations = [...otherRegs, ...orgRegs];
          }

          if (attRes.data) {
            const orgAtt: AttendanceRecord[] = attRes.data.map((a: any) => {
              const opp = this.opportunities.find((o) => o.id === a.opportunity_id || o.id === ensureUUID(a.opportunity_id));
              return {
                id: a.id,
                opportunity_id: a.opportunity_id,
                opportunity_title: a.opportunity_title || opp?.title,
                volunteer_id: a.volunteer_id,
                status: a.status || 'unmarked',
                hours_awarded: a.hours_awarded || 0,
                is_verified_org_at_completion: a.is_verified_org_at_completion ?? true,
                marked_at: a.marked_at || new Date().toISOString(),
              };
            });
            const otherAtt = this.attendance.filter((a) => !myOppIds.includes(a.opportunity_id));
            this.attendance = [...otherAtt, ...orgAtt];
          }
        }

        this.saveToStorage();
      } catch (e) {
        console.error('Organizer data sync error:', e);
      }
    }, 15000, force);
  }

  // 5. Scoped Admin Data Sync (Only when admin is authenticated in Admin Portal)
  public async syncAdminData(force?: boolean): Promise<void> {
    if (!isSupabaseConfigured()) return;
    return this.dedupe('sync_admin_data', async () => {
      try {
        const [msgsRes, profsRes, orgsRes] = await Promise.all([
          supabase
            .from('contact_messages')
            .select('id, user_id, user_name, user_email, category, subject, message, is_read, created_at')
            .order('created_at', { ascending: false })
            .limit(100),
          supabase
            .from('profiles')
            .select('id, krow_id, role, email, name, dob, country, province_state, city, location_set, bio, avatar_url, created_at')
            .limit(100),
          supabase
            .from('organizer_profiles')
            .select('id, org_name, hq_country, hq_province_state, hq_city, hq_address, no_hq, bio, logo_url, verification_status, created_at')
            .limit(100),
        ]);

        if (msgsRes.data) {
          this.contactMessages = msgsRes.data.map((m: any) => ({
            id: m.id,
            user_id: m.user_id || undefined,
            user_name: m.user_name || 'User',
            user_email: m.user_email || '',
            category: m.category || 'general',
            subject: m.subject || '',
            message: m.message || '',
            is_read: m.is_read ?? false,
            created_at: m.created_at || new Date().toISOString(),
          }));
        }

        if (profsRes.data) {
          this.profiles = profsRes.data.map((p: any) => {
            const mapped: UserProfile = {
              id: p.id,
              krow_id: p.krow_id || undefined,
              role: p.role || 'volunteer',
              email: p.email || '',
              name: p.name || 'Volunteer',
              dob: p.dob || undefined,
              country: p.country || 'Canada',
              province_state: p.province_state || 'BC',
              city: p.city || 'Vancouver',
              location_set: p.location_set ?? true,
              bio: p.bio || undefined,
              avatar_url: p.avatar_url || undefined,
              created_at: p.created_at || new Date().toISOString(),
            };
            this.ensureKrowId(mapped);
            return mapped;
          });
        }

        if (orgsRes.data) {
          this.organizers = orgsRes.data.map((sOrg: any) => ({
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
          }));
        }

        this.saveToStorage();
      } catch (e) {
        console.error('Admin data sync error:', e);
      }
    }, 30000, force);
  }

  // 6. Scoped Backward Compatibility Sync (Never downloads all tables unconditionally)
  public async syncWithSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      if (this.currentUser) {
        if (this.currentUser.role === 'organizer') {
          await Promise.all([this.syncOrganizerData(this.currentUser.id), this.syncOpportunities()]);
        } else {
          await Promise.all([this.syncVolunteerData(this.currentUser.id), this.syncOpportunities()]);
        }
      } else {
        await this.syncOpportunities();
      }
    } catch (e) {
      console.error('Scoped sync error:', e);
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
      localStorage.setItem('krow_contact_messages', JSON.stringify(this.contactMessages));
      localStorage.setItem('krow_certificates', JSON.stringify(this.certificates));
      localStorage.setItem('krow_profiles', JSON.stringify(this.profiles));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }

  private loadFromStorage() {
    try {
      // Force purge stale local storage if legacy mock keys or ghost accounts exist
      const cacheVer = localStorage.getItem('krow_cache_v5_ghost_purge');
      if (!cacheVer) {
        localStorage.clear();
        localStorage.setItem('krow_cache_v5_ghost_purge', 'true');
        return;
      }

      const storedCategories = localStorage.getItem('krow_categories');
      if (storedCategories) this.categories = JSON.parse(storedCategories);

      const storedProfiles = localStorage.getItem('krow_profiles');
      if (storedProfiles) this.profiles = JSON.parse(storedProfiles);

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

      // Backfill missing opportunity_title on local attendance records if opportunity is present
      this.attendance.forEach((att) => {
        if (!att.opportunity_title) {
          const opp = this.opportunities.find((o) => o.id === att.opportunity_id || o.id === ensureUUID(att.opportunity_id));
          if (opp?.title) {
            att.opportunity_title = opp.title;
          }
        }
      });

      const storedNotifs = localStorage.getItem('krow_notifications');
      if (storedNotifs) this.notifications = JSON.parse(storedNotifs);

      const storedSaved = localStorage.getItem('krow_saved');
      if (storedSaved) this.savedOpportunityIds = JSON.parse(storedSaved);

      const storedAudit = localStorage.getItem('krow_audit');
      if (storedAudit) this.hourAuditLogs = JSON.parse(storedAudit);

      const storedMsgs = localStorage.getItem('krow_contact_messages');
      if (storedMsgs) this.contactMessages = JSON.parse(storedMsgs);

      const storedCerts = localStorage.getItem('krow_certificates');
      if (storedCerts) this.certificates = JSON.parse(storedCerts);

      // Auto-backfill krow_id for all profiles & currentUser
      this.profiles.forEach((p) => this.ensureKrowId(p));
      if (this.currentUser) this.ensureKrowId(this.currentUser);
    } catch (e) {
      console.error('Storage load error', e);
    }
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public async getProfileFromSupabase(id: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !id) return null;
    try {
      const uUUID = ensureUUID(id);
      const { data } = await supabase
        .from('profiles')
        .select('id, krow_id, role, email, name, dob, country, province_state, city, location_set, bio, avatar_url, created_at')
        .or(`id.eq.${id},id.eq.${uUUID}`)
        .single();
      if (data) {
        const mapped: UserProfile = {
          id: data.id,
          krow_id: data.krow_id || undefined,
          role: data.role || 'volunteer',
          email: data.email || '',
          name: data.name || 'User',
          dob: data.dob || undefined,
          country: data.country || 'Canada',
          province_state: data.province_state || 'BC',
          city: data.city || 'Vancouver',
          location_set: true,
          bio: data.bio || undefined,
          avatar_url: data.avatar_url || undefined,
          created_at: data.created_at || new Date().toISOString(),
        };
        this.ensureKrowId(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('getProfileFromSupabase error:', e);
    }
    return null;
  }

  public async saveProfileToSupabase(user: UserProfile): Promise<boolean> {
    if (!isSupabaseConfigured() || !user) return false;
    try {
      this.ensureKrowId(user);
      const uId = ensureUUID(user.id);
      
      const payload: any = {
        id: uId,
        role: user.role || 'volunteer',
        email: user.email || '',
        name: user.name || 'User',
        dob: user.dob || null,
        country: user.country || 'Canada',
        province_state: user.province_state || 'BC',
        city: user.city || 'Vancouver',
        bio: user.bio || null,
        avatar_url: user.avatar_url || null,
      };

      if (user.krow_id) {
        payload.krow_id = user.krow_id;
      }

      // First attempt with krow_id
      let { error } = await supabase.from('profiles').upsert([payload], { onConflict: 'id' });

      // Fallback if krow_id column does not exist on target table in Supabase
      if (error && (error.message?.includes('krow_id') || error.code === 'PGRST204')) {
        delete payload.krow_id;
        const res = await supabase.from('profiles').upsert([payload], { onConflict: 'id' });
        error = res.error;
      }

      if (error) {
        console.error('Supabase profile upsert error details:', error.message || error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase profile save error:', err);
      return false;
    }
  }

  public async saveOrganizerToSupabase(org: OrganizerProfile): Promise<boolean> {
    if (!isSupabaseConfigured() || !org) return false;
    try {
      const orgId = ensureUUID(org.id);
      const { error: pErr } = await supabase.from('profiles').upsert([
        {
          id: orgId,
          role: 'organizer',
          email: this.currentUser?.email || `${org.org_name.toLowerCase().replace(/\s+/g, '')}@org.com`,
          name: org.org_name,
          country: org.hq_country || 'Canada',
          province_state: org.hq_province_state || 'BC',
          city: org.hq_city || 'Vancouver',
        },
      ]);
      if (pErr) console.error('Supabase parent profile upsert for org error:', pErr);

      const { error: oErr } = await supabase.from('organizer_profiles').upsert([
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
          verification_status: org.verification_status || 'pending',
        },
      ]);
      if (oErr) console.error('Supabase organizer_profiles upsert error:', oErr);
      return true;
    } catch (err) {
      console.error('Supabase save organizer error:', err);
      return false;
    }
  }

  public setCurrentUser(user: UserProfile | null) {
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('krow_explicit_logged_out');
      }
      const uId = ensureUUID(user.id);
      user.id = uId;
      this.ensureKrowId(user);
      const pIdx = this.profiles.findIndex((p) => p.id === uId || ensureUUID(p.id) === uId);
      const existingInStore = pIdx >= 0 ? this.profiles[pIdx] : (this.currentUser && (this.currentUser.id === uId || ensureUUID(this.currentUser.id) === uId) ? this.currentUser : null);

      if (existingInStore) {
        user = {
          ...existingInStore,
          ...user,
          dob: user.dob || existingInStore.dob || undefined,
          krow_id: user.krow_id || existingInStore.krow_id || undefined,
        };
      }

      if (pIdx >= 0) {
        this.profiles[pIdx] = { ...user };
      } else {
        this.profiles.push({ ...user });
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('krow_currentUser');
        localStorage.setItem('krow_explicit_logged_out', 'true');
      }
      if (isSupabaseConfigured()) {
        supabase.auth.signOut().catch(() => {});
      }
    }
    this.currentUser = user;
    this.saveToStorage();

    if (user && isSupabaseConfigured()) {
      this.saveProfileToSupabase(user);

      if (user.role === 'organizer') {
        const existingOrg = this.getOrganizer(user.id);
        const orgToSave: OrganizerProfile = existingOrg || {
          id: user.id,
          org_name: user.name,
          hq_country: user.country || 'Canada',
          hq_province_state: user.province_state || 'BC',
          hq_city: user.city || 'Vancouver',
          no_hq: false,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
        };
        this.saveOrganizer(orgToSave);
      }
    }
  }

  public async logout(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krow_currentUser');
      localStorage.setItem('krow_explicit_logged_out', 'true');
    }
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
  }

  public updateProfile(updates: Partial<UserProfile>) {
    if (!this.currentUser) return;
    const existingDob = this.currentUser.dob;
    const existingKrowId = this.currentUser.krow_id;

    this.currentUser = {
      ...this.currentUser,
      ...updates,
      dob: updates.dob || existingDob,
      krow_id: updates.krow_id || existingKrowId,
    };
    this.ensureKrowId(this.currentUser);

    const pUUID = ensureUUID(this.currentUser.id);
    const pIdx = this.profiles.findIndex((p) => p.id === this.currentUser?.id || p.id === pUUID || ensureUUID(p.id) === pUUID);
    if (pIdx >= 0) {
      this.profiles[pIdx] = { ...this.profiles[pIdx], ...this.currentUser };
    } else {
      this.profiles.push({ ...this.currentUser });
    }

    this.saveToStorage();

    if (isSupabaseConfigured()) {
      this.saveProfileToSupabase(this.currentUser);
    }
  }

  public async deleteAccount(userId: string): Promise<boolean> {
    const uUUID = ensureUUID(userId);

    // 1. Remove from local memory & storage
    this.profiles = this.profiles.filter((p) => p.id !== userId && ensureUUID(p.id) !== uUUID);
    this.organizers = this.organizers.filter((o) => o.id !== userId && ensureUUID(o.id) !== uUUID);
    this.registrations = this.registrations.filter((r) => r.volunteer_id !== userId && ensureUUID(r.volunteer_id) !== uUUID);
    this.attendance = this.attendance.filter((a) => a.volunteer_id !== userId && ensureUUID(a.volunteer_id) !== uUUID);
    this.notifications = this.notifications.filter((n) => n.user_id !== userId && ensureUUID(n.user_id) !== uUUID);

    if (this.currentUser && (this.currentUser.id === userId || ensureUUID(this.currentUser.id) === uUUID)) {
      this.currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('krow_currentUser');
        localStorage.setItem('krow_explicit_logged_out', 'true');
      }
    }

    this.saveToStorage();

    // 2. Permanently delete from Supabase tables & sign out session
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('organizer_profiles').delete().or(`id.eq.${userId},id.eq.${uUUID}`);
        await supabase.from('registrations').delete().or(`volunteer_id.eq.${userId},volunteer_id.eq.${uUUID}`);
        await supabase.from('attendance').delete().or(`volunteer_id.eq.${userId},volunteer_id.eq.${uUUID}`);
        await supabase.from('notifications').delete().or(`user_id.eq.${userId},user_id.eq.${uUUID}`);
        
        const { error: profErr } = await supabase.from('profiles').delete().or(`id.eq.${userId},id.eq.${uUUID}`);
        if (profErr) {
          console.error('Error deleting profile from Supabase:', profErr);
        }

        await supabase.auth.signOut();
        return true;
      } catch (err) {
        console.error('Error in deleteAccount Supabase execution:', err);
        return false;
      }
    }
    return true;
  }

  public async deleteProfile(userId: string): Promise<boolean> {
    return this.deleteAccount(userId);
  }

  // --- Certificates & Verification System ---
  public issueCertificate(userId: string): CertificateRecord {
    let user = this.getProfile(userId) || (this.currentUser && (this.currentUser.id === userId || ensureUUID(this.currentUser.id) === ensureUUID(userId)) ? this.currentUser : null);

    if (!user && this.currentUser) {
      user = this.currentUser;
    }

    if (!user) {
      user = {
        id: userId,
        role: 'volunteer',
        email: '',
        name: 'Volunteer',
        country: 'Canada',
        province_state: 'BC',
        city: 'Vancouver',
        created_at: new Date().toISOString(),
      };
      this.ensureKrowId(user);
      this.profiles.push(user);
    } else {
      this.ensureKrowId(user);
    }

    const totalHours = this.calculateVolunteerTotalHours(userId);
    const completedShifts = this.calculateVolunteerCompletedShifts(userId);
    const existingCertIds = this.certificates.map((c) => c.certificate_id);
    const newCertId = generateCertificateId(user.krow_id, existingCertIds);

    const newCert: CertificateRecord = {
      id: ensureUUID(`cert-${Date.now()}-${Math.floor(Math.random() * 1000000)}`),
      certificate_id: newCertId,
      user_id: user.id,
      krow_id: user.krow_id!,
      student_name: user.name || 'Volunteer',
      hours: Math.round(totalHours * 10) / 10,
      activity_count: completedShifts,
      issued_at: new Date().toISOString(),
      status: 'VALID',
      created_at: new Date().toISOString(),
    };

    const existingIdx = this.certificates.findIndex((c) => c.certificate_id === newCert.certificate_id);
    if (existingIdx >= 0) {
      this.certificates[existingIdx] = newCert;
    } else {
      this.certificates.push(newCert);
    }

    this.saveToStorage();

    if (isSupabaseConfigured()) {
      supabase
        .from('certificates')
        .upsert([
          {
            id: newCert.id,
            certificate_id: newCert.certificate_id,
            user_id: ensureUUID(newCert.user_id),
            krow_id: newCert.krow_id,
            student_name: newCert.student_name,
            hours: newCert.hours,
            activity_count: newCert.activity_count,
            issued_at: newCert.issued_at,
            status: newCert.status,
            created_at: newCert.created_at,
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Supabase certificate upsert error:', error);
        });
    }

    return newCert;
  }

  public getCertificateById(certificateId: string): CertificateRecord | undefined {
    if (!certificateId) return undefined;
    const cleanId = certificateId.trim().toUpperCase();
    return this.certificates.find((c) => c.certificate_id.toUpperCase() === cleanId);
  }

  public async getCertificateByIdAsync(certificateId: string): Promise<CertificateRecord | undefined> {
    if (!certificateId) return undefined;
    const cleanId = certificateId.trim().toUpperCase();

    // 1. Check local in-memory certificates
    const localMatch = this.getCertificateById(cleanId);
    if (localMatch) return localMatch;

    // 2. Query Supabase 'certificates' table directly
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('certificates')
          .select('id, certificate_id, user_id, krow_id, student_name, hours, activity_count, issued_at, status, created_at')
          .eq('certificate_id', cleanId)
          .single();
        if (data) {
          const mapped: CertificateRecord = {
            id: data.id,
            certificate_id: data.certificate_id,
            user_id: data.user_id,
            krow_id: data.krow_id,
            student_name: data.student_name || 'Volunteer',
            hours: data.hours || 0,
            activity_count: data.activity_count || 0,
            issued_at: data.issued_at || new Date().toISOString(),
            status: data.status || 'VALID',
            created_at: data.created_at || new Date().toISOString(),
          };
          const idx = this.certificates.findIndex((c) => c.certificate_id === mapped.certificate_id);
          if (idx >= 0) this.certificates[idx] = mapped;
          else this.certificates.push(mapped);
          this.saveToStorage();
          return mapped;
        }
      } catch (e) {}
    }

    // 3. Fallback: Parse KROW ID embedded in Certificate ID & lookup against Supabase profiles and attendance
    const extractedKrowId = parseKrowIdFromCertId(cleanId);
    if (extractedKrowId) {
      let matchedProfile = this.profiles.find((p) => p.krow_id?.toUpperCase() === extractedKrowId.toUpperCase());

      if (!matchedProfile && isSupabaseConfigured()) {
        try {
          const { data: pData } = await supabase
            .from('profiles')
            .select('id, krow_id, role, email, name, country, province_state, city, created_at')
            .eq('krow_id', extractedKrowId)
            .single();
          if (pData) {
            matchedProfile = {
              id: pData.id,
              krow_id: pData.krow_id,
              role: pData.role || 'volunteer',
              email: pData.email || '',
              name: pData.name || 'Volunteer',
              country: pData.country || 'Canada',
              province_state: pData.province_state || 'BC',
              city: pData.city || 'Vancouver',
              created_at: pData.created_at || new Date().toISOString(),
            };
            this.ensureKrowId(matchedProfile);
            this.profiles.push(matchedProfile);
          }
        } catch (e) {}
      }

      if (matchedProfile) {
        const totalHours = this.calculateVolunteerTotalHours(matchedProfile.id);
        const completedShifts = this.calculateVolunteerCompletedShifts(matchedProfile.id);

        const syntheticCert: CertificateRecord = {
          id: ensureUUID(`cert-${cleanId}`),
          certificate_id: cleanId,
          user_id: matchedProfile.id,
          krow_id: matchedProfile.krow_id || extractedKrowId,
          student_name: matchedProfile.name,
          hours: Math.round(totalHours * 10) / 10,
          activity_count: completedShifts,
          issued_at: new Date().toISOString(),
          status: 'VALID',
          created_at: new Date().toISOString(),
        };

        const cIdx = this.certificates.findIndex((c) => c.certificate_id === cleanId);
        if (cIdx >= 0) this.certificates[cIdx] = syntheticCert;
        else this.certificates.push(syntheticCert);
        this.saveToStorage();

        return syntheticCert;
      }
    }

    return undefined;
  }

  public getCertificatesForUser(userId: string): CertificateRecord[] {
    const pUUID = ensureUUID(userId);
    return this.certificates.filter((c) => c.user_id === userId || ensureUUID(c.user_id) === pUUID);
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
    // Auto-sync any profiles with role === 'organizer' into this.organizers
    this.profiles.forEach((p) => {
      if (p.role === 'organizer') {
        const pUUID = ensureUUID(p.id);
        const exists = this.organizers.some((o) => o.id === p.id || o.id === pUUID || ensureUUID(o.id) === pUUID);
        if (!exists) {
          this.organizers.push({
            id: p.id,
            org_name: p.name || 'Organization',
            hq_country: p.country || 'Canada',
            hq_province_state: p.province_state || 'BC',
            hq_city: p.city || 'Vancouver',
            no_hq: false,
            verification_status: 'pending',
            created_at: p.created_at || new Date().toISOString(),
          });
        }
      }
    });
    return [...this.organizers];
  }

  public getOrganizer(id: string): OrganizerProfile | undefined {
    const orgUUID = ensureUUID(id);
    return this.organizers.find((o) => o.id === id || o.id === orgUUID || ensureUUID(o.id) === orgUUID);
  }

  public async updateOrganizerVerification(orgId: string, status: VerificationStatus): Promise<void> {
    const orgUUID = ensureUUID(orgId);
    let org = this.organizers.find((o) => o.id === orgId || o.id === orgUUID || ensureUUID(o.id) === orgUUID);
    if (!org) {
      // Fallback lookup in profiles
      const prof = this.profiles.find((p) => p.id === orgId || p.id === orgUUID || ensureUUID(p.id) === orgUUID);
      if (prof) {
        org = {
          id: prof.id,
          org_name: prof.name || 'Organization',
          hq_country: prof.country || 'Canada',
          hq_province_state: prof.province_state || 'BC',
          hq_city: prof.city || 'Vancouver',
          no_hq: false,
          verification_status: status,
          created_at: prof.created_at || new Date().toISOString(),
        };
        this.organizers.push(org);
      }
    }

    if (!org) return;

    org.verification_status = status;

    // Update opportunities org_verification_status
    this.opportunities.forEach((opp) => {
      if (opp.org_id === orgId || opp.org_id === orgUUID || ensureUUID(opp.org_id) === orgUUID) {
        opp.org_verification_status = status;
      }
    });

    // Retroactively update attendance hours for this organization's opportunities
    const orgOppIds = new Set(
      this.opportunities
        .filter((o) => o.org_id === orgId || o.org_id === orgUUID || ensureUUID(o.org_id) === orgUUID)
        .map((o) => o.id)
    );
    this.attendance.forEach((att) => {
      if (orgOppIds.has(att.opportunity_id) && att.status === 'here') {
        const opp = this.opportunities.find((o) => o.id === att.opportunity_id);
        att.is_verified_org_at_completion = status === 'verified';
        att.hours_awarded = status === 'verified' ? opp?.duration_hours || 0 : 0;
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

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('organizer_profiles')
          .upsert([
            {
              id: orgUUID,
              org_name: org.org_name,
              hq_country: org.hq_country || 'Canada',
              hq_province_state: org.hq_province_state || 'BC',
              hq_city: org.hq_city || 'Vancouver',
              hq_address: org.hq_address || null,
              no_hq: org.no_hq || false,
              bio: org.bio || null,
              logo_url: org.logo_url || null,
              verification_status: status,
            },
          ]);

        await supabase
          .from('opportunities')
          .update({ org_verification_status: status })
          .eq('org_id', orgUUID);
      } catch (err) {
        console.error('Supabase update verification status error:', err);
      }
    }
  }

  public async deleteOrganizer(orgId: string): Promise<void> {
    const orgUUID = ensureUUID(orgId);
    this.organizers = this.organizers.filter((o) => o.id !== orgId && o.id !== orgUUID);
    this.opportunities = this.opportunities.filter((o) => o.org_id !== orgId && o.org_id !== orgUUID);
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('organizer_profiles').delete().or(`id.eq.${orgId},id.eq.${orgUUID}`);
        await supabase.from('profiles').delete().or(`id.eq.${orgId},id.eq.${orgUUID}`);
        await supabase.from('opportunities').delete().or(`org_id.eq.${orgId},org_id.eq.${orgUUID}`);
      } catch (err) {
        console.error('Supabase delete organizer error:', err);
      }
    }
  }


  public async saveOrganizer(org: OrganizerProfile): Promise<boolean> {
    const orgId = ensureUUID(org.id);
    org.id = orgId;

    const index = this.organizers.findIndex((o) => o.id === org.id);
    if (index >= 0) {
      this.organizers[index] = { ...this.organizers[index], ...org };
    } else {
      this.organizers.push(org);
    }

    if (this.currentUser && (this.currentUser.id === orgId || ensureUUID(this.currentUser.id) === orgId)) {
      this.currentUser.avatar_url = org.logo_url || this.currentUser.avatar_url;
      this.currentUser.name = org.org_name;
    }

    // Update opportunities matching this org_id so org_name and logo stay in sync!
    this.opportunities.forEach((opp) => {
      if (opp.org_id === org.id || ensureUUID(opp.org_id) === orgId) {
        opp.org_name = org.org_name;
        opp.org_logo_url = org.logo_url;
      }
    });

    this.saveToStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'organizer_profiles' } }));
    }

    if (isSupabaseConfigured()) {
      try {
        // 1. Ensure parent profile row exists in Supabase with avatar_url
        const { error: pErr } = await supabase
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
              avatar_url: org.logo_url || null,
            },
          ]);
        if (pErr) console.error('Supabase profile upsert for org error:', pErr);

        // 2. Upsert organizer profile row
        const { error: oErr } = await supabase
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
          ]);
        if (oErr) {
          console.error('Supabase organizer upsert error:', oErr);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Save organizer error:', err);
        return false;
      }
    }
    return true;
  }

  // --- Opportunities ---
  public autoPurgeExpiredOpportunities(): void {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const now = Date.now();
    const expiredOppIds: string[] = [];

    this.opportunities.forEach((opp) => {
      // 1. Purge if ended_at timestamp is > 1 hour ago
      if (opp.status === 'ended' && opp.ended_at) {
        const endedMs = new Date(opp.ended_at).getTime();
        if (now - endedMs >= ONE_HOUR_MS) {
          expiredOppIds.push(opp.id);
        }
      } else if (opp.status === 'ended' && !opp.ended_at) {
        // Fallback: Purge ended opps past their event date
        const oppDateMs = new Date(opp.date + 'T23:59:59').getTime();
        if (now - oppDateMs >= ONE_HOUR_MS) {
          expiredOppIds.push(opp.id);
        }
      }
    });

    expiredOppIds.forEach((id) => {
      this.deleteOpportunity(id);
    });
  }

  public getOpportunities(): Opportunity[] {
    this.autoPurgeExpiredOpportunities();
    return this.opportunities
      .filter((opp) => opp.status !== 'archived')
      .map((opp) => {
        return {
          ...opp,
          registered_count: this.getRegisteredCount(opp.id),
        };
      });
  }

  public getOpportunity(id: string): Opportunity | undefined {
    const opps = this.getOpportunities();
    return opps.find((o) => o.id === id);
  }

  public createOpportunity(oppData: Omit<Opportunity, 'id' | 'created_at' | 'status'> & Partial<Opportunity>): Opportunity {
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

    const isRecurring = !!oppData.is_recurring;
    const recurrenceType = isRecurring ? (oppData.recurrence_type || 'different_volunteers') : undefined;
    const recurrenceFrequency = isRecurring ? (oppData.recurrence_frequency || 'every_week') : undefined;
    const recurrenceCount = isRecurring ? Math.max(2, oppData.recurrence_count || 3) : undefined;
    const seriesId = isRecurring ? (oppData.recurrence_series_id || ensureUUID('series-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4))) : undefined;

    const calcDate = (baseDateStr: string, idx: number, freq?: RecurrenceFrequency): string => {
      const d = new Date(baseDateStr + 'T00:00:00');
      if (freq === 'every_day') {
        d.setDate(d.getDate() + idx);
      } else if (freq === 'every_other_week') {
        d.setDate(d.getDate() + (idx * 14));
      } else if (freq === 'every_month') {
        d.setMonth(d.getMonth() + idx);
      } else {
        d.setDate(d.getDate() + (idx * 7));
      }
      return d.toISOString().split('T')[0];
    };

    if (isRecurring && recurrenceType === 'different_volunteers' && recurrenceCount) {
      // MODE 1: Different Volunteers = Generate N separate opportunities
      const createdOpps: Opportunity[] = [];

      for (let i = 0; i < recurrenceCount; i++) {
        const occDateStr = calcDate(oppData.date, i, recurrenceFrequency);
        const oppId = ensureUUID('opp-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 4));

        const occOpp: Opportunity = {
          ...oppData,
          id: oppId,
          org_id: orgId,
          org_name: oppData.org_name || org?.org_name || 'Organization',
          org_verification_status: oppData.org_verification_status || org?.verification_status || 'verified',
          org_logo_url: oppData.org_logo_url || org?.logo_url || undefined,
          date: occDateStr,
          is_recurring: true,
          recurrence_type: 'different_volunteers',
          recurrence_frequency: recurrenceFrequency,
          recurrence_series_id: seriesId,
          recurrence_count: recurrenceCount,
          occurrence_number: i + 1,
          status: 'published',
          registered_count: 0,
          created_at: new Date().toISOString(),
        };

        this.opportunities.unshift(occOpp);
        createdOpps.push(occOpp);

        if (isSupabaseConfigured()) {
          supabase.from('opportunities').upsert([{
            id: oppId,
            org_id: orgId,
            title: occOpp.title,
            description: occOpp.description || null,
            instructions: occOpp.instructions || null,
            category_id: occOpp.category_id || 'community',
            banner_url: occOpp.banner_url || null,
            date: occDateStr,
            start_time: occOpp.start_time,
            end_time: occOpp.end_time,
            duration_hours: occOpp.duration_hours || 2,
            location_type: occOpp.location_type || 'physical',
            location_address: occOpp.location_address || null,
            min_age: occOpp.min_age || null,
            max_age: occOpp.max_age || null,
            max_volunteers: occOpp.max_volunteers || null,
            is_recurring: true,
            recurrence_type: 'different_volunteers',
            recurrence_series_id: seriesId,
            status: 'published',
          }]).then(({ error }) => {
            if (error) console.error('Supabase opportunity upsert error:', error);
          });
        }
      }

      this.saveToStorage();
      return createdOpps[0];
    } else if (isRecurring && recurrenceType === 'same_volunteers' && recurrenceCount) {
      // MODE 2: Same Volunteer = Create 1 main public opportunity listing + N child occurrence records
      const occurrence_dates: string[] = [];

      for (let i = 0; i < recurrenceCount; i++) {
        occurrence_dates.push(calcDate(oppData.date, i, recurrenceFrequency));
      }

      const series_start_date = occurrence_dates[0];
      const series_end_date = occurrence_dates[occurrence_dates.length - 1];
      const total_series_hours = (oppData.duration_hours || 2) * recurrenceCount;

      const mainOppId = ensureUUID('opp-' + Date.now() + '-main-' + Math.random().toString(36).substr(2, 4));
      const mainOpp: Opportunity = {
        ...oppData,
        id: mainOppId,
        org_id: orgId,
        org_name: oppData.org_name || org?.org_name || 'Organization',
        org_verification_status: oppData.org_verification_status || org?.verification_status || 'verified',
        org_logo_url: oppData.org_logo_url || org?.logo_url || undefined,
        date: series_start_date,
        is_recurring: true,
        recurrence_type: 'same_volunteers',
        recurrence_frequency: recurrenceFrequency,
        recurrence_series_id: seriesId,
        recurrence_count: recurrenceCount,
        occurrence_dates,
        series_start_date,
        series_end_date,
        total_series_hours,
        status: 'published',
        registered_count: 0,
        created_at: new Date().toISOString(),
      };

      this.opportunities.unshift(mainOpp);

      // Create child occurrence records for individual occurrence attendance tracking
      for (let i = 0; i < recurrenceCount; i++) {
        const childId = ensureUUID('opp-' + Date.now() + '-child-' + i + '-' + Math.random().toString(36).substr(2, 4));
        const childOpp: Opportunity = {
          ...oppData,
          id: childId,
          org_id: orgId,
          org_name: oppData.org_name || org?.org_name || 'Organization',
          org_verification_status: oppData.org_verification_status || org?.verification_status || 'verified',
          org_logo_url: oppData.org_logo_url || org?.logo_url || undefined,
          date: occurrence_dates[i],
          is_recurring: true,
          recurrence_type: 'same_volunteers',
          recurrence_frequency: recurrenceFrequency,
          recurrence_series_id: seriesId,
          recurrence_count: recurrenceCount,
          occurrence_number: i + 1,
          series_start_date,
          series_end_date,
          total_series_hours,
          status: 'published',
          registered_count: 0,
          created_at: new Date().toISOString(),
        };
        this.opportunities.push(childOpp);
      }

      this.saveToStorage();

      if (isSupabaseConfigured()) {
        const childUpsertList = this.opportunities
          .filter((o) => o.recurrence_series_id === seriesId && o.occurrence_number !== undefined)
          .map((cOpp) => ({
            id: cOpp.id,
            org_id: orgId,
            title: cOpp.title,
            description: cOpp.description || null,
            instructions: cOpp.instructions || null,
            category_id: cOpp.category_id || 'community',
            banner_url: cOpp.banner_url || null,
            date: cOpp.date,
            start_time: cOpp.start_time,
            end_time: cOpp.end_time,
            duration_hours: cOpp.duration_hours || 2,
            location_type: cOpp.location_type || 'physical',
            location_address: cOpp.location_address || null,
            min_age: cOpp.min_age || null,
            max_age: cOpp.max_age || null,
            max_volunteers: cOpp.max_volunteers || null,
            is_recurring: true,
            recurrence_type: 'same_volunteers',
            recurrence_frequency: recurrenceFrequency,
            recurrence_series_id: seriesId,
            recurrence_count: cOpp.recurrence_count || recurrenceCount,
            occurrence_number: cOpp.occurrence_number,
            occurrence_dates: cOpp.occurrence_dates || occurrence_dates,
            series_start_date: cOpp.series_start_date || series_start_date,
            series_end_date: cOpp.series_end_date || series_end_date,
            total_series_hours: cOpp.total_series_hours || total_series_hours,
            status: 'published',
          }));

        supabase.from('opportunities').upsert([
          {
            id: mainOppId,
            org_id: orgId,
            title: mainOpp.title,
            description: mainOpp.description || null,
            instructions: mainOpp.instructions || null,
            category_id: mainOpp.category_id || 'community',
            banner_url: mainOpp.banner_url || null,
            date: mainOpp.date,
            start_time: mainOpp.start_time,
            end_time: mainOpp.end_time,
            duration_hours: mainOpp.duration_hours || 2,
            location_type: mainOpp.location_type || 'physical',
            location_address: mainOpp.location_address || null,
            min_age: mainOpp.min_age || null,
            max_age: mainOpp.max_age || null,
            max_volunteers: mainOpp.max_volunteers || null,
            is_recurring: true,
            recurrence_type: 'same_volunteers',
            recurrence_frequency: recurrenceFrequency,
            recurrence_series_id: seriesId,
            recurrence_count: mainOpp.recurrence_count || recurrenceCount,
            occurrence_dates: mainOpp.occurrence_dates || occurrence_dates,
            series_start_date: mainOpp.series_start_date || series_start_date,
            series_end_date: mainOpp.series_end_date || series_end_date,
            total_series_hours: mainOpp.total_series_hours || total_series_hours,
            status: 'published',
          },
          ...childUpsertList,
        ]).then(({ error }) => {
          if (error) console.error('Supabase opportunity upsert error:', error);
        });
      }

      return mainOpp;
    }

    // Default One-Time Opportunity creation
    const oppId = ensureUUID('opp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4));
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
      supabase.from('opportunities').upsert([{
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
      }]).then(({ error }) => {
        if (error) console.error('Supabase opportunity upsert error:', error);
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
    const opp = this.opportunities.find((o) => o.id === id || o.id === oppUUID);

    const idsToDelete = new Set<string>();
    idsToDelete.add(id);
    idsToDelete.add(oppUUID);

    // If deleting a recurring opportunity, also delete all sibling occurrences in the series
    if (opp?.recurrence_series_id) {
      const seriesId = opp.recurrence_series_id;
      this.opportunities.forEach((o) => {
        if (o.recurrence_series_id === seriesId) {
          idsToDelete.add(o.id);
          idsToDelete.add(ensureUUID(o.id));
        }
      });
    }

    // Preserve opportunity title & organization name on attendance records before deleting opportunity
    const resolvedOrgName = opp?.org_name || (opp?.org_id ? this.getOrganizer(opp.org_id)?.org_name : undefined);
    this.attendance.forEach((att) => {
      if (idsToDelete.has(att.opportunity_id) || idsToDelete.has(ensureUUID(att.opportunity_id))) {
        if (!att.opportunity_title && opp?.title) {
          att.opportunity_title = opp.title;
        }
        if (!att.org_id && opp?.org_id) {
          att.org_id = opp.org_id;
        }
        if (!att.org_name && resolvedOrgName) {
          att.org_name = resolvedOrgName;
        }
      }
    });

    // Filter out opportunity & registrations from local state, BUT KEEP ATTENDANCE INTACT!
    this.opportunities = this.opportunities.filter((o) => !idsToDelete.has(o.id));
    this.registrations = this.registrations.filter((r) => !idsToDelete.has(r.opportunity_id));
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        const idList = Array.from(idsToDelete);
        // Delete registrations for this opportunity from Supabase
        await supabase.from('registrations').delete().in('opportunity_id', idList);
        // Delete opportunity post rows from Supabase
        const { error } = await supabase.from('opportunities').delete().in('id', idList);
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

    // Preserve opportunity titles on attendance records before clearing
    pastOppIds.forEach((oppId) => {
      const opp = this.opportunities.find((o) => o.id === oppId);
      if (opp?.title) {
        this.attendance.forEach((att) => {
          if (att.opportunity_id === oppId) {
            if (!att.opportunity_title) {
              att.opportunity_title = opp.title;
            }
          }
        });
      }
    });

    this.opportunities = this.opportunities.filter((o) => !pastOppIds.has(o.id));
    this.registrations = this.registrations.filter((r) => !pastOppIds.has(r.opportunity_id));
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        for (const oppId of Array.from(pastOppIds)) {
          const oppUUID = ensureUUID(oppId);
          await supabase.from('registrations').delete().eq('opportunity_id', oppUUID);
          await supabase.from('opportunities').delete().eq('id', oppUUID);
        }
      } catch (err) {
        console.error('Supabase clear past opportunities error:', err);
      }
    }
  }

  // --- Profile Lookup Helpers ---
  public getProfile(userId: string): UserProfile | null {
    if (!userId) return null;
    const uUUID = ensureUUID(userId);
    if (this.currentUser && (this.currentUser.id === userId || this.currentUser.id === uUUID || ensureUUID(this.currentUser.id) === uUUID)) {
      return this.currentUser;
    }
    return this.profiles.find((p) => p.id === userId || p.id === uUUID || ensureUUID(p.id) === uUUID) || null;
  }

  // --- Registration Logic ---
  public getRegisteredCount(opportunityId: string): number {
    const opp = this.opportunities.find((o) => o.id === opportunityId || ensureUUID(o.id) === ensureUUID(opportunityId));
    const oppUUID = ensureUUID(opportunityId);
    const targetOppIds = new Set<string>();
    targetOppIds.add(opportunityId);
    targetOppIds.add(oppUUID);

    if (opp) {
      targetOppIds.add(opp.id);
      targetOppIds.add(ensureUUID(opp.id));
      if (opp.recurrence_series_id) {
        this.opportunities.forEach((o) => {
          if (o.recurrence_series_id === opp.recurrence_series_id) {
            targetOppIds.add(o.id);
            targetOppIds.add(ensureUUID(o.id));
          }
        });
      }
    }

    const uniqueVolunteers = new Set<string>();

    this.registrations.forEach((r) => {
      if (r.status === 'registered') {
        const regOppUUID = ensureUUID(r.opportunity_id);
        if (
          targetOppIds.has(r.opportunity_id) ||
          targetOppIds.has(regOppUUID) ||
          (opp?.recurrence_series_id && r.opportunity_id === opp.recurrence_series_id)
        ) {
          uniqueVolunteers.add(ensureUUID(r.volunteer_id));
        }
      }
    });

    return uniqueVolunteers.size;
  }

  public getRegistrationsForOpportunity(opportunityId: string): Registration[] {
    const oppUUID = ensureUUID(opportunityId);
    const seenVolunteers = new Set<string>();
    const list: Registration[] = [];

    this.registrations.forEach((r) => {
      if (
        (r.opportunity_id === opportunityId || r.opportunity_id === oppUUID) &&
        r.status === 'registered'
      ) {
        if (!seenVolunteers.has(r.volunteer_id)) {
          seenVolunteers.add(r.volunteer_id);
          list.push(r);
        }
      }
    });

    return list;
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

  public async registerForOpportunity(
    opportunityId: string,
    volunteerId: string
  ): Promise<{ success: boolean; message: string }> {
    const opp = this.opportunities.find((o) => o.id === opportunityId || ensureUUID(o.id) === ensureUUID(opportunityId));
    if (!opp) return { success: false, message: 'Opportunity not found' };

    // Targeted real-time capacity check on Supabase directly (zero whole-database download)
    if (isSupabaseConfigured()) {
      try {
        const { count } = await supabase
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .eq('opportunity_id', ensureUUID(opportunityId))
          .eq('status', 'registered');
        if (count !== null && opp.max_volunteers !== undefined && opp.max_volunteers !== null && count >= opp.max_volunteers) {
          return { success: false, message: 'This opportunity is full.' };
        }
      } catch (e) {}
    }

    if (opp.status !== 'published') {
      return { success: false, message: 'Opportunity is no longer active' };
    }

    // Cutoff check
    const oppDateStr = opp.date;
    const nowStr = new Date().toISOString().split('T')[0];
    if (nowStr > oppDateStr && (!opp.is_recurring || opp.recurrence_type !== 'same_volunteers')) {
      return { success: false, message: 'Registration has closed for past opportunities.' };
    }

    // Strict Age Eligibility Verification (accounting for exact month/day on event date)
    const user = this.getProfile(volunteerId);
    if (!user || !user.dob) {
      return {
        success: false,
        message: 'Please enter your Date of Birth in Profile Settings before signing up.',
      };
    }

    const birthDate = new Date(user.dob);
    const eventDate = new Date(opp.date);
    let ageOnEvent = eventDate.getFullYear() - birthDate.getFullYear();
    const m = eventDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && eventDate.getDate() < birthDate.getDate())) {
      ageOnEvent--;
    }

    if (opp.min_age !== null && opp.min_age !== undefined && ageOnEvent < opp.min_age) {
      return {
        success: false,
        message: `Age requirement not met. Minimum age for this opportunity is ${opp.min_age}+ (Your age on event date is ${ageOnEvent}).`,
      };
    }

    if (opp.max_age !== null && opp.max_age !== undefined && ageOnEvent > opp.max_age) {
      return {
        success: false,
        message: `Age requirement not met. Maximum age for this opportunity is ${opp.max_age} (Your age on event date is ${ageOnEvent}).`,
      };
    }

    // Handle Recurring — Same Volunteer registration for ALL occurrences in series
    if (opp.is_recurring && opp.recurrence_type === 'same_volunteers' && opp.recurrence_series_id) {
      const seriesOpps = this.opportunities.filter((o) => o.recurrence_series_id === opp.recurrence_series_id);

      // Capacity check on main series
      const currentActiveRegs = this.getRegisteredCount(opp.id);
      if (opp.max_volunteers !== null && opp.max_volunteers !== undefined && currentActiveRegs >= opp.max_volunteers) {
        return { success: false, message: 'This recurring opportunity series is full.' };
      }

      // Register volunteer for ALL occurrences in series
      const regsToUpsert: any[] = [];
      seriesOpps.forEach((sOpp) => {
        const existing = this.registrations.find(
          (r) => (r.opportunity_id === sOpp.id || r.opportunity_id === ensureUUID(sOpp.id)) && r.volunteer_id === volunteerId
        );
        let regId = existing?.id;
        if (!existing) {
          regId = ensureUUID('reg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7));
          this.registrations.push({
            id: regId,
            opportunity_id: sOpp.id,
            volunteer_id: volunteerId,
            registered_at: new Date().toISOString(),
            status: 'registered',
          });
        } else {
          existing.status = 'registered';
          existing.registered_at = new Date().toISOString();
        }
        regsToUpsert.push({
          id: ensureUUID(regId!),
          opportunity_id: ensureUUID(sOpp.id),
          volunteer_id: ensureUUID(volunteerId),
          status: 'registered',
          registered_at: new Date().toISOString(),
        });
        sOpp.registered_count = this.getRegisteredCount(sOpp.id);
      });

      if (isSupabaseConfigured() && regsToUpsert.length > 0) {
        supabase.from('registrations').upsert(regsToUpsert).then(({ error }) => {
          if (error) console.error('Supabase recurring registration upsert error:', error);
        });
      }

      const recCount = opp.recurrence_count || seriesOpps.length || 1;
      this.addNotification({
        user_id: volunteerId,
        title: 'Recurring Registration Confirmed!',
        message: `You're signed up! ${opp.title} (${recCount} occurrences). You are registered for all dates.`,
        type: 'registration_confirmed',
        link: '/dashboard',
      });

      this.addNotification({
        user_id: opp.org_id,
        title: 'New Recurring Volunteer Sign-Up',
        message: `${user?.name || 'A volunteer'} registered for all ${recCount} occurrences of "${opp.title}".`,
        type: 'volunteer_signed_up',
        link: '/organizer',
      });

      this.saveToStorage();
      return { success: true, message: `You are confirmed for all ${recCount} occurrences of ${opp.title}!` };
    }

    // Capacity Check
    const currentActiveRegs = this.getRegisteredCount(opportunityId);

    if (opp.max_volunteers !== null && opp.max_volunteers !== undefined && currentActiveRegs >= opp.max_volunteers) {
      return { success: false, message: 'This opportunity is full.' };
    }

    let regId = ensureUUID('reg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7));
    const existing = this.registrations.find(
      (r) =>
        (r.opportunity_id === opportunityId || r.opportunity_id === ensureUUID(opportunityId)) &&
        r.volunteer_id === volunteerId
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

  public async unsignFromOpportunity(
    opportunityId: string,
    volunteerId: string
  ): Promise<{ success: boolean; message: string }> {
    const opp = this.opportunities.find((o) => o.id === opportunityId || ensureUUID(o.id) === ensureUUID(opportunityId));
    if (!opp) return { success: false, message: 'Opportunity not found' };

    if (opp.is_recurring && opp.recurrence_type === 'same_volunteers' && opp.recurrence_series_id) {
      // Unregister volunteer from ALL occurrences in series
      const seriesOpps = this.opportunities.filter((o) => o.recurrence_series_id === opp.recurrence_series_id);
      const regsToUpsert: any[] = [];
      seriesOpps.forEach((sOpp) => {
        const reg = this.registrations.find(
          (r) => (r.opportunity_id === sOpp.id || r.opportunity_id === ensureUUID(sOpp.id)) && r.volunteer_id === volunteerId && r.status === 'registered'
        );
        if (reg) {
          reg.status = 'unsigned';
          regsToUpsert.push({
            id: ensureUUID(reg.id),
            opportunity_id: ensureUUID(sOpp.id),
            volunteer_id: ensureUUID(volunteerId),
            status: 'unsigned',
            registered_at: reg.registered_at,
          });
        }
        sOpp.registered_count = this.getRegisteredCount(sOpp.id);
      });

      if (isSupabaseConfigured() && regsToUpsert.length > 0) {
        supabase.from('registrations').upsert(regsToUpsert).then(({ error }) => {
          if (error) console.error('Supabase series unsign upsert error:', error);
        });
      }

      this.addNotification({
        user_id: opp.org_id,
        title: 'Volunteer Unsigned from Series',
        message: `${this.currentUser?.name || 'A volunteer'} left the recurring commitment "${opp.title}". Spots are now available for all occurrences.`,
        type: 'volunteer_unsigned',
        link: '/organizer',
      });

      this.saveToStorage();
      return { success: true, message: `You have left all occurrences of ${opp.title}.` };
    }

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

  public getAttendanceForVolunteer(volunteerId: string): AttendanceRecord[] {
    const volUUID = ensureUUID(volunteerId);
    return this.attendance.filter(
      (a) => a.volunteer_id === volunteerId || a.volunteer_id === volUUID || ensureUUID(a.volunteer_id) === volUUID
    );
  }

  public markAttendance(
    opportunityId: string,
    volunteerId: string,
    status: 'here' | 'not_here'
  ): AttendanceRecord {
    const opp = this.opportunities.find((o) => o.id === opportunityId || o.id === ensureUUID(opportunityId));
    const oppTitle = opp?.title;
    const org = this.organizers.find(
      (o) => o.id === opp?.org_id || (opp?.org_id && ensureUUID(o.id) === ensureUUID(opp.org_id))
    );

    // Organization MUST be verified (verification_status === 'verified') to award volunteer hours!
    const isVerified = (org?.verification_status || opp?.org_verification_status || 'verified') === 'verified';
    const hoursAwarded = status === 'here' && isVerified ? opp?.duration_hours || 0 : 0;
    let att = this.attendance.find(
      (a) =>
        (a.opportunity_id === opportunityId || a.opportunity_id === ensureUUID(opportunityId)) &&
        a.volunteer_id === volunteerId
    );

    const resolvedOrgName = opp?.org_name || org?.org_name || 'Partner Organization';

    if (att) {
      att.status = status;
      att.hours_awarded = hoursAwarded;
      att.is_verified_org_at_completion = isVerified;
      if (oppTitle) att.opportunity_title = oppTitle;
      if (opp?.org_id) att.org_id = opp.org_id;
      if (resolvedOrgName) att.org_name = resolvedOrgName;
      att.marked_at = new Date().toISOString();
    } else {
      att = {
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        opportunity_id: opportunityId,
        opportunity_title: oppTitle,
        org_id: opp?.org_id,
        org_name: resolvedOrgName,
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

    if (isSupabaseConfigured()) {
      const attUUID = ensureUUID(att.id);
      const oppUUID = ensureUUID(opportunityId);
      const volUUID = ensureUUID(volunteerId);

      supabase
        .from('attendance')
        .upsert([
          {
            id: attUUID,
            opportunity_id: oppUUID,
            volunteer_id: volUUID,
            status,
            hours_awarded: hoursAwarded,
            is_verified_org_at_completion: isVerified,
            marked_at: att.marked_at,
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Supabase attendance upsert error:', error);
        });
    }

    return att;
  }

  public async endEvent(opportunityId: string): Promise<void> {
    const oppUUID = ensureUUID(opportunityId);
    const opp = this.opportunities.find((o) => o.id === opportunityId || o.id === oppUUID);
    if (!opp) return;

    opp.status = 'ended';
    opp.ended_at = new Date().toISOString();

    const regs = this.registrations.filter(
      (r) => (r.opportunity_id === opportunityId || r.opportunity_id === oppUUID)
    );

    regs.forEach((reg) => {
      reg.status = 'completed';

      const existing = this.attendance.find(
        (a) =>
          (a.opportunity_id === opportunityId || a.opportunity_id === oppUUID) &&
          a.volunteer_id === reg.volunteer_id
      );

      if (!existing || existing.status === 'unmarked') {
        this.markAttendance(opportunityId, reg.volunteer_id, 'not_here');
      }
    });

    this.saveToStorage();

    // Delete opportunity from Supabase PostgreSQL & local feeds while preserving volunteer hours
    await this.deleteOpportunity(opportunityId);
  }

  public calculateVolunteerTotalHours(volunteerId: string): number {
    const volUUID = ensureUUID(volunteerId);
    const total = this.attendance
      .filter((a) => (a.volunteer_id === volunteerId || a.volunteer_id === volUUID) && a.status === 'here')
      .reduce((sum, a) => sum + (a.hours_awarded || 0), 0);
    return Math.round(total * 10) / 10;
  }

  public calculateVolunteerCompletedShifts(volunteerId: string): number {
    const volUUID = ensureUUID(volunteerId);
    return this.attendance.filter(
      (a) =>
        (a.volunteer_id === volunteerId || a.volunteer_id === volUUID) &&
        a.status === 'here' &&
        a.opportunity_id !== 'admin-adjustment'
    ).length;
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

  public getVolunteers(): UserProfile[] {
    const list: UserProfile[] = [];
    const seen = new Set<string>();

    if (this.currentUser && (this.currentUser.role === 'volunteer' || !this.currentUser.role)) {
      list.push(this.currentUser);
      seen.add(this.currentUser.id);
    }

    this.profiles.forEach((p) => {
      if (!seen.has(p.id) && (p.role === 'volunteer' || !p.role)) {
        seen.add(p.id);
        list.push(p);
      }
    });

    // Include volunteers from attendance records
    this.attendance.forEach((att) => {
      if (!seen.has(att.volunteer_id)) {
        seen.add(att.volunteer_id);
        const prof = this.getProfile(att.volunteer_id);
        list.push(
          prof || {
            id: att.volunteer_id,
            role: 'volunteer',
            email: 'volunteer@gmail.com',
            name: att.volunteer_name || `Volunteer (${att.volunteer_id.slice(-4)})`,
            country: 'Canada',
            province_state: 'BC',
            city: 'Vancouver',
            created_at: new Date().toISOString(),
          }
        );
      }
    });

    return [...list];
  }

  public adminEditVolunteerHours(
    volunteerId: string,
    newTotalHours: number,
    adminId: string,
    reason?: string
  ): { success: boolean; message: string } {
    const volUUID = ensureUUID(volunteerId);

    // Sum of regular shift hours (excluding any admin adjustment record)
    const regularShiftHours = this.attendance
      .filter(
        (a) =>
          (a.volunteer_id === volunteerId || a.volunteer_id === volUUID) &&
          a.status === 'here' &&
          a.opportunity_id !== 'admin-adjustment'
      )
      .reduce((sum, a) => sum + (a.hours_awarded || 0), 0);

    const adjustmentNeeded = newTotalHours - regularShiftHours;

    let adjAtt = this.attendance.find(
      (a) =>
        (a.volunteer_id === volunteerId || a.volunteer_id === volUUID) &&
        a.opportunity_id === 'admin-adjustment'
    );

    const originalTotal = this.calculateVolunteerTotalHours(volunteerId);

    if (adjAtt) {
      adjAtt.hours_awarded = adjustmentNeeded;
      adjAtt.status = adjustmentNeeded !== 0 ? 'here' : 'unmarked';
      adjAtt.marked_at = new Date().toISOString();
    } else if (adjustmentNeeded !== 0) {
      adjAtt = {
        id: 'att-adj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        opportunity_id: 'admin-adjustment',
        opportunity_title: 'Admin Hours Adjustment',
        volunteer_id: volunteerId,
        status: 'here',
        hours_awarded: adjustmentNeeded,
        is_verified_org_at_completion: true,
        marked_at: new Date().toISOString(),
      };
      this.attendance.push(adjAtt);
    }

    const auditLog: HourAuditLog = {
      id: 'audit-' + Date.now(),
      attendance_id: adjAtt?.id || 'admin-adj',
      volunteer_id: volunteerId,
      opportunity_id: 'admin-adjustment',
      original_hours: originalTotal,
      new_hours: newTotalHours,
      edited_by: adminId,
      reason: reason || 'Krow Admin total volunteer hours correction',
      created_at: new Date().toISOString(),
    };

    this.hourAuditLogs.unshift(auditLog);

    this.addNotification({
      user_id: volunteerId,
      title: 'Volunteer Hours Adjusted',
      message: `Krow Admin adjusted your total volunteer hours to ${newTotalHours}h.`,
      type: 'admin_hours_edited',
      link: '/dashboard',
    });

    this.saveToStorage();

    if (isSupabaseConfigured() && adjAtt) {
      const attUUID = ensureUUID(adjAtt.id);
      supabase
        .from('attendance')
        .upsert([
          {
            id: attUUID,
            opportunity_id: ensureUUID('admin-adjustment'),
            opportunity_title: 'Admin Hours Adjustment',
            volunteer_id: volUUID,
            status: adjAtt.status,
            hours_awarded: adjAtt.hours_awarded,
            is_verified_org_at_completion: true,
            marked_at: adjAtt.marked_at,
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Supabase admin adjustment error:', error);
        });
    }

    return { success: true, message: `Volunteer total hours updated to ${newTotalHours} hrs!` };
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

  public getVolunteerAttendance(volunteerId: string): AttendanceRecord[] {
    const volUUID = ensureUUID(volunteerId);
    return this.attendance.filter(
      (a) => a.volunteer_id === volunteerId || a.volunteer_id === volUUID
    );
  }

  public getAllAttendanceRecords(): AttendanceRecord[] {
    return this.attendance;
  }

  // --- Contact Messages ---
  public submitContactMessage(data: Omit<ContactMessage, 'id' | 'created_at'>): ContactMessage {
    const msgId = ensureUUID('msg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6));
    const newMsg: ContactMessage = {
      ...data,
      id: msgId,
      created_at: new Date().toISOString(),
    };
    this.contactMessages.unshift(newMsg);

    // Add confirmation notification to the user
    if (data.user_id) {
      this.addNotification({
        user_id: data.user_id,
        title: 'Message Received',
        message: `Your inquiry "${data.subject}" has been received by Krow Support. We will review it shortly.`,
        type: 'contact_sent',
        link: '/profile',
      });
    }

    this.saveToStorage();

    if (isSupabaseConfigured()) {
      supabase
        .from('contact_messages')
        .upsert([
          {
            id: msgId,
            user_id: data.user_id ? ensureUUID(data.user_id) : null,
            user_name: data.user_name,
            user_email: data.user_email,
            category: data.category,
            subject: data.subject,
            message: data.message,
            is_read: false,
            created_at: newMsg.created_at,
          },
        ])
        .then(({ error }) => {
          if (error) console.error('Supabase contact message upsert error:', error);
        });
    }

    return newMsg;
  }

  public getContactMessages(): ContactMessage[] {
    return [...this.contactMessages];
  }

  public async deleteContactMessage(id: string): Promise<void> {
    const msgUUID = ensureUUID(id);
    this.contactMessages = this.contactMessages.filter((m) => m.id !== id && m.id !== msgUUID);
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('contact_messages').delete().or(`id.eq.${id},id.eq.${msgUUID}`);
      } catch (err) {
        console.error('Supabase delete contact message error:', err);
      }
    }
  }

  public async deleteAllContactMessages(): Promise<void> {
    this.contactMessages = [];
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('contact_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.error('Supabase delete all contact messages error:', err);
      }
    }
  }

  public async resetSystemData(): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Reset in-memory state
      this.categories = [...INITIAL_CATEGORIES];
      this.organizers = [];
      this.opportunities = [];
      this.currentUser = null;
      this.profiles = [];
      this.registrations = [];
      this.attendance = [];
      this.notifications = [];
      this.savedOpportunityIds = [];
      this.hourAuditLogs = [];
      this.contactMessages = [];
      this.certificates = [];

      // 2. Clear LocalStorage
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'krow_categories',
          'krow_organizers',
          'krow_opportunities',
          'krow_currentUser',
          'krow_registrations',
          'krow_attendance',
          'krow_notifications',
          'krow_saved',
          'krow_audit',
          'krow_contact_messages',
          'krow_certificates',
          'krow_profiles',
        ];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        localStorage.setItem('krow_cache_v5_ghost_purge', 'true');
      }

      // 3. Clear Supabase database tables if Supabase is configured
      if (isSupabaseConfigured()) {
        const dummyUuid = '00000000-0000-0000-0000-000000000000';

        // Delete from dependent tables first (foreign keys)
        await supabase.from('hour_audit_logs').delete().neq('id', dummyUuid);
        await supabase.from('saved_opportunities').delete().neq('id', dummyUuid);
        await supabase.from('registrations').delete().neq('id', dummyUuid);
        await supabase.from('attendance').delete().neq('id', dummyUuid);
        await supabase.from('notifications').delete().neq('id', dummyUuid);
        await supabase.from('certificates').delete().neq('id', dummyUuid);
        await supabase.from('contact_messages').delete().neq('id', dummyUuid);

        // Delete opportunities, organizer profiles, profiles
        await supabase.from('opportunities').delete().neq('id', dummyUuid);
        await supabase.from('organizer_profiles').delete().neq('id', dummyUuid);
        await supabase.from('profiles').delete().neq('id', dummyUuid);

        // Delete custom categories
        await supabase.from('categories').delete().eq('is_custom', true);

        // Sign out active session from Supabase auth
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase auth signout error during reset:', e);
        }
      }

      return { success: true, message: 'System successfully reset to clean launch ready state!' };
    } catch (error: any) {
      console.error('System reset error:', error);
      return { success: false, message: error?.message || 'An error occurred during system reset.' };
    }
  }

  // Realtime Granular Event Handlers (Zero full-database re-downloads)
  public handleRealtimeRegistrationChange(payload: any) {
    const { eventType, new: newRec, old: oldRec } = payload;
    if (eventType === 'INSERT' && newRec) {
      const mapped: Registration = {
        id: newRec.id,
        opportunity_id: newRec.opportunity_id,
        volunteer_id: newRec.volunteer_id,
        registered_at: newRec.registered_at || new Date().toISOString(),
        status: newRec.status || 'registered',
      };
      const idx = this.registrations.findIndex(
        (r) => r.id === mapped.id || (r.opportunity_id === mapped.opportunity_id && r.volunteer_id === mapped.volunteer_id)
      );
      if (idx >= 0) this.registrations[idx] = mapped;
      else this.registrations.push(mapped);
    } else if (eventType === 'UPDATE' && newRec) {
      const idx = this.registrations.findIndex((r) => r.id === newRec.id);
      if (idx >= 0) {
        this.registrations[idx] = { ...this.registrations[idx], ...newRec };
      }
    } else if (eventType === 'DELETE' && oldRec?.id) {
      this.registrations = this.registrations.filter((r) => r.id !== oldRec.id);
    }
    this.saveToStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'registrations' } }));
    }
  }

  public handleRealtimeOpportunityChange(payload: any) {
    const { eventType, new: newRec, old: oldRec } = payload;
    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRec) {
      const mapped = this.mapOpportunitiesFromDb([newRec])[0];
      if (mapped) {
        const idx = this.opportunities.findIndex((o) => o.id === mapped.id);
        if (idx >= 0) this.opportunities[idx] = mapped;
        else this.opportunities.push(mapped);
      }
    } else if (eventType === 'DELETE' && oldRec?.id) {
      this.opportunities = this.opportunities.filter((o) => o.id !== oldRec.id);
    }
    this.saveToStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'opportunities' } }));
    }
  }

  public handleRealtimeAttendanceChange(payload: any) {
    const { eventType, new: newRec, old: oldRec } = payload;
    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRec) {
      const opp = this.opportunities.find((o) => o.id === newRec.opportunity_id || o.id === ensureUUID(newRec.opportunity_id));
      const mapped: AttendanceRecord = {
        id: newRec.id,
        opportunity_id: newRec.opportunity_id,
        opportunity_title: newRec.opportunity_title || opp?.title,
        volunteer_id: newRec.volunteer_id,
        status: newRec.status || 'unmarked',
        hours_awarded: newRec.hours_awarded || 0,
        is_verified_org_at_completion: newRec.is_verified_org_at_completion ?? true,
        marked_at: newRec.marked_at || new Date().toISOString(),
      };
      const idx = this.attendance.findIndex(
        (a) => a.id === mapped.id || (a.opportunity_id === mapped.opportunity_id && a.volunteer_id === mapped.volunteer_id)
      );
      if (idx >= 0) this.attendance[idx] = mapped;
      else this.attendance.push(mapped);
    } else if (eventType === 'DELETE' && oldRec?.id) {
      this.attendance = this.attendance.filter((a) => a.id !== oldRec.id);
    }
    this.saveToStorage();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'attendance' } }));
    }
  }

  public handleRealtimeProfileChange(payload: any) {
    const { eventType, new: newRec } = payload;
    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRec) {
      if (this.currentUser && (this.currentUser.id === newRec.id || ensureUUID(this.currentUser.id) === ensureUUID(newRec.id))) {
        this.currentUser = {
          ...this.currentUser,
          ...newRec,
          dob: newRec.dob || this.currentUser.dob,
          krow_id: newRec.krow_id || this.currentUser.krow_id,
        };
        this.saveToStorage();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'profiles' } }));
        }
      }
    }
  }

  public handleRealtimeOrganizerChange(payload: any): void {
    if (!payload) return;
    const { eventType, new: newRec, old: oldRec } = payload;
    if (eventType === 'DELETE' && oldRec?.id) {
      const delId = oldRec.id;
      const delUUID = ensureUUID(delId);
      this.organizers = this.organizers.filter((o) => o.id !== delId && ensureUUID(o.id) !== delUUID);
      this.opportunities = this.opportunities.filter(
        (opp) => opp.org_id !== delId && ensureUUID(opp.org_id) !== delUUID
      );
      this.saveToStorage();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'organizer_profiles', event: 'DELETE' } }));
      }
    } else if (eventType === 'INSERT' || eventType === 'UPDATE') {
      if (newRec?.id) {
        const mapped: OrganizerProfile = {
          id: newRec.id,
          org_name: newRec.org_name,
          hq_country: newRec.hq_country || 'Canada',
          hq_province_state: newRec.hq_province_state || 'BC',
          hq_city: newRec.hq_city || 'Vancouver',
          hq_address: newRec.hq_address,
          no_hq: newRec.no_hq || false,
          bio: newRec.bio,
          logo_url: newRec.logo_url,
          verification_status: newRec.verification_status || 'verified',
          created_at: newRec.created_at || new Date().toISOString(),
        };
        const idx = this.organizers.findIndex((o) => o.id === mapped.id || ensureUUID(o.id) === ensureUUID(mapped.id));
        if (idx >= 0) {
          this.organizers[idx] = { ...this.organizers[idx], ...mapped };
        } else {
          this.organizers.push(mapped);
        }
        // Update associated opportunities with new org logo & name
        this.opportunities.forEach((opp) => {
          if (opp.org_id === mapped.id || ensureUUID(opp.org_id) === ensureUUID(mapped.id)) {
            opp.org_name = mapped.org_name;
            opp.org_logo_url = mapped.logo_url;
            opp.org_verification_status = mapped.verification_status;
          }
        });
        this.saveToStorage();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('krow_data_change', { detail: { table: 'organizer_profiles', event: eventType } }));
        }
      }
    }
  }
}

export const db = new LocalDatabase();

if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  try {
    supabase
      .channel('krow-realtime-granular')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, (payload: any) => {
        db.handleRealtimeRegistrationChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, (payload: any) => {
        db.handleRealtimeOpportunityChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, (payload: any) => {
        db.handleRealtimeAttendanceChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
        db.handleRealtimeProfileChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'organizer_profiles' }, (payload: any) => {
        db.handleRealtimeOrganizerChange(payload);
      })
      .subscribe();
  } catch (e) {
    console.warn('Realtime subscription setup warning:', e);
  }
}
