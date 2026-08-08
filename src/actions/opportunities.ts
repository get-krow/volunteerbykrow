"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CreateOpportunityParams {
  title: string;
  category?: string;
  location: string;
  eventDate?: string;
  eventTime?: string;
  hours: string;
  capacity: string;
  description: string;
  imageUrl?: string;
}

export async function createOpportunityAction(params: CreateOpportunityParams, clientUserId?: string) {
  try {
    const supabase = await createClient();
    const { data: { user: serverUser } } = await supabase.auth.getUser();

    let user = serverUser;
    const admin = createAdminClient();

    if (!user && clientUserId) {
      const { data: adminUser } = await admin.auth.admin.getUserById(clientUserId);
      if (adminUser?.user) {
        user = adminUser.user;
      }
    }

    if (!user) {
      return { error: "You must be logged in as an organization to post an opportunity. Please sign in again." };
    }

    // 1. Get or create Organization for this user
    let orgId: string | null = null;

    const { data: existingOrg, error: findOrgErr } = await admin
      .from("organizations")
      .select("id")
      .eq("created_by", user.id)
      .limit(1)
      .maybeSingle();

    if (existingOrg?.id) {
      orgId = existingOrg.id;
    } else {
      // Auto-create organization row using admin client
      const orgName = user.user_metadata?.full_name || "My Organization";
      const slug = (orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "org") + "-" + Date.now().toString(36);

      const { data: newOrg, error: createOrgErr } = await admin
        .from("organizations")
        .insert({
          name: orgName,
          slug,
          email: user.email || "org@krow.app",
          created_by: user.id,
          verification_status: "verified",
        })
        .select("id")
        .single();

      if (createOrgErr || !newOrg) {
        console.error("Error auto-creating organization:", createOrgErr);
        return { error: "Failed to initialize organization profile: " + (createOrgErr?.message || "Unknown error") };
      }

      orgId = newOrg.id;

      // Add org_members ownership row
      await admin.from("org_members").insert({
        organization_id: orgId,
        user_id: user.id,
        role: "owner",
      });
    }

    const isRemote = params.location.toLowerCase().includes("remote") || params.location.toLowerCase().includes("online");
    const defaultImage = params.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80";

    // 2. Insert Opportunity into Supabase Opportunities Database Table
    const { data: opportunity, error: oppErr } = await admin
      .from("opportunities")
      .insert({
        organization_id: orgId,
        title: params.title || "New Volunteer Opportunity",
        description: (params.description || "Join us and make a positive impact in the community!") + (params.eventTime ? `\n\nShift Time: ${params.eventTime}` : ""),
        address: params.location || "Coquitlam, BC, Canada",
        is_remote: isRemote,
        start_date: params.eventDate ? `${params.eventDate}T12:00:00.000Z` : new Date().toISOString(),
        capacity: parseInt(params.capacity) || 20,
        spots_filled: 0,
        volunteer_hours: parseFloat(params.hours) || 4,
        status: "published",
        images: [defaultImage],
        skills_required: ["Community Service", "Teamwork"],
      })
      .select("id, title")
      .single();

    if (oppErr || !opportunity) {
      console.error("Error inserting opportunity into Supabase database:", oppErr);
      return { error: "Failed to save opportunity to database: " + (oppErr?.message || "Unknown error") };
    }

    return { success: true, opportunityId: opportunity.id, title: opportunity.title };
  } catch (err: any) {
    console.error("Unhandled error in createOpportunityAction:", err);
    return { error: err?.message || "An unexpected error occurred while publishing." };
  }
}

export async function getOpportunitiesAction(options?: {
  orgUserId?: string;
  category?: string;
  limit?: number;
}) {
  try {
    const admin = createAdminClient();

    let orgIdFilter: string | null = null;
    if (options?.orgUserId) {
      const { data: org } = await admin
        .from("organizations")
        .select("id")
        .eq("created_by", options.orgUserId)
        .limit(1)
        .maybeSingle();

      if (org?.id) {
        orgIdFilter = org.id;
      } else {
        // User has not created an organization or posted any opportunities yet
        return { success: true, opportunities: [] };
      }
    }

    let query = admin
      .from("opportunities")
      .select(`
        *,
        organizations (
          id,
          name,
          logo_url,
          verification_status,
          city,
          province_state,
          country
        )
      `)
      .order("created_at", { ascending: false });

    if (orgIdFilter) {
      query = query.eq("organization_id", orgIdFilter);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching opportunities:", error);
      return { error: error.message, opportunities: [] };
    }

    // Enrich opportunities with live exact application counts
    const oppsWithLiveCounts = await Promise.all((data || []).map(async (opp) => {
      const { count } = await admin
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("opportunity_id", opp.id);

      const realSpotsFilled = count !== null ? count : (opp.spots_filled || 0);
      return {
        ...opp,
        spots_filled: realSpotsFilled,
      };
    }));

    return { success: true, opportunities: oppsWithLiveCounts };
  } catch (err: any) {
    console.error("Unhandled error in getOpportunitiesAction:", err);
    return { error: err?.message || "Failed to load opportunities", opportunities: [] };
  }
}

export async function getOpportunityByIdAction(id: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("opportunities")
      .select(`
        *,
        organizations (
          id,
          name,
          description,
          logo_url,
          email,
          website,
          verification_status,
          city,
          province_state,
          country
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching opportunity details:", error);
      return { error: error.message };
    }

    if (data) {
      const { count } = await admin
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("opportunity_id", id);

      data.spots_filled = count !== null ? count : (data.spots_filled || 0);
    }

    return { success: true, opportunity: data };
  } catch (err: any) {
    console.error("Unhandled error in getOpportunityByIdAction:", err);
    return { error: err?.message || "Failed to fetch opportunity" };
  }
}
