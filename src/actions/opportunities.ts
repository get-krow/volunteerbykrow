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
        start_date: params.eventDate ? new Date(params.eventDate).toISOString() : new Date().toISOString(),
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
