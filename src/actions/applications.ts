"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function applyForOpportunityAction(opportunityId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user || authError) {
      return { error: "You must be logged in as a volunteer to sign up for an opportunity." };
    }

    const admin = createAdminClient();

    // 1. Check if application already exists
    const { data: existing } = await admin
      .from("applications")
      .select("id, status")
      .eq("opportunity_id", opportunityId)
      .eq("volunteer_id", user.id)
      .maybeSingle();

    if (existing) {
      return { success: true, message: "Already registered for this opportunity", applicationId: existing.id };
    }

    // 2. Insert application into Supabase applications table
    const { data: app, error: appErr } = await admin
      .from("applications")
      .insert({
        opportunity_id: opportunityId,
        volunteer_id: user.id,
        status: "pending",
      })
      .select("id")
      .single();

    if (appErr || !app) {
      console.error("Error creating application:", appErr);
      return { error: "Failed to submit registration: " + (appErr?.message || "Unknown error") };
    }

    // 3. Increment spots_filled on opportunities table
    const { data: opp } = await admin.from("opportunities").select("spots_filled").eq("id", opportunityId).single();
    if (opp) {
      await admin.from("opportunities").update({ spots_filled: (opp.spots_filled || 0) + 1 }).eq("id", opportunityId);
    }

    return { success: true, applicationId: app.id, message: "Registration successful!" };
  } catch (err: any) {
    console.error("Unhandled error in applyForOpportunityAction:", err);
    return { error: err?.message || "An unexpected error occurred during signup." };
  }
}

export async function getUserApplicationsAction(userId?: string) {
  try {
    const supabase = await createClient();
    let currentUserId = userId;

    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      currentUserId = user?.id;
    }

    if (!currentUserId) {
      return { success: true, applications: [] };
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        opportunity_id,
        opportunities (
          id,
          title,
          description,
          address,
          is_remote,
          start_date,
          volunteer_hours,
          status,
          images,
          organizations (
            id,
            name,
            logo_url
          )
        )
      `)
      .eq("volunteer_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user applications:", error);
      return { error: error.message, applications: [] };
    }

    return { success: true, applications: data || [] };
  } catch (err: any) {
    console.error("Unhandled error in getUserApplicationsAction:", err);
    return { error: err?.message || "Failed to fetch applications", applications: [] };
  }
}

export async function getOrgApplicationsAction(orgUserId?: string) {
  try {
    const admin = createAdminClient();
    let userId = orgUserId;

    if (!userId) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      return { success: true, applications: [] };
    }

    // Get organization for user
    const { data: org } = await admin.from("organizations").select("id").eq("created_by", userId).limit(1).maybeSingle();
    if (!org) {
      return { success: true, applications: [] };
    }

    // Get opportunities for org
    const { data: opps } = await admin.from("opportunities").select("id").eq("organization_id", org.id);
    const oppIds = opps?.map(o => o.id) || [];

    if (oppIds.length === 0) {
      return { success: true, applications: [] };
    }

    const { data, error } = await admin
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        volunteer_id,
        opportunity_id,
        profiles (
          id,
          full_name,
          email,
          avatar_url,
          total_hours
        ),
        opportunities (
          id,
          title,
          volunteer_hours,
          start_date
        )
      `)
      .in("opportunity_id", oppIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching org applications:", error);
      return { error: error.message, applications: [] };
    }

    return { success: true, applications: data || [] };
  } catch (err: any) {
    console.error("Unhandled error in getOrgApplicationsAction:", err);
    return { error: err?.message || "Failed to load org applications", applications: [] };
  }
}

export async function verifyAttendanceAction(applicationId: string, volunteerId: string, opportunityId: string, hours: number) {
  try {
    const admin = createAdminClient();

    // 1. Update application status to approved
    await admin.from("applications").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", applicationId);

    // 2. Get opportunity details
    const { data: opp } = await admin.from("opportunities").select("organization_id, volunteer_hours").eq("id", opportunityId).single();
    const verifiedHours = hours || opp?.volunteer_hours || 4;
    const orgId = opp?.organization_id;

    // 3. Record in volunteer_hours table
    if (orgId) {
      await admin.from("volunteer_hours").insert({
        volunteer_id: volunteerId,
        opportunity_id: opportunityId,
        organization_id: orgId,
        hours: verifiedHours,
        date: new Date().toISOString().split("T")[0],
        status: "approved",
        notes: "Attendance verified by organization",
      });
    }

    // 4. Update profile total_hours
    const { data: profile } = await admin.from("profiles").select("total_hours").eq("id", volunteerId).single();
    const currentHours = parseFloat(profile?.total_hours || "0");
    const updatedHours = currentHours + verifiedHours;

    await admin.from("profiles").update({ total_hours: updatedHours }).eq("id", volunteerId);

    return { success: true, message: `Attendance verified! ${verifiedHours} hours credited to volunteer.` };
  } catch (err: any) {
    console.error("Unhandled error in verifyAttendanceAction:", err);
    return { error: err?.message || "Failed to verify attendance" };
  }
}

export async function deleteOpportunityAction(opportunityId: string) {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("opportunities").delete().eq("id", opportunityId);

    if (error) {
      console.error("Error deleting opportunity:", error);
      return { error: error.message };
    }

    return { success: true, message: "Opportunity deleted permanently from Supabase." };
  } catch (err: any) {
    console.error("Unhandled error in deleteOpportunityAction:", err);
    return { error: err?.message || "Failed to delete opportunity" };
  }
}

export async function updateOpportunityAction(opportunityId: string, params: any) {
  try {
    const admin = createAdminClient();
    const isRemote = params.location?.toLowerCase().includes("remote") || params.location?.toLowerCase().includes("online");

    const { error } = await admin.from("opportunities").update({
      title: params.title,
      description: params.description,
      address: params.location,
      is_remote: isRemote,
      start_date: params.eventDate ? new Date(params.eventDate).toISOString() : new Date().toISOString(),
      capacity: parseInt(params.capacity) || 20,
      volunteer_hours: parseFloat(params.hours) || 4,
      images: params.imageUrl ? [params.imageUrl] : undefined,
      updated_at: new Date().toISOString(),
    }).eq("id", opportunityId);

    if (error) {
      console.error("Error updating opportunity:", error);
      return { error: error.message };
    }

    return { success: true, message: "Opportunity updated successfully!" };
  } catch (err: any) {
    console.error("Unhandled error in updateOpportunityAction:", err);
    return { error: err?.message || "Failed to update opportunity" };
  }
}

export async function cancelApplicationAction(opportunityId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in as a volunteer to cancel a registration." };
    }

    const admin = createAdminClient();

    // 1. Delete application row
    const { error: delErr } = await admin
      .from("applications")
      .delete()
      .eq("opportunity_id", opportunityId)
      .eq("volunteer_id", user.id);

    if (delErr) {
      console.error("Error cancelling application:", delErr);
      return { error: delErr.message };
    }

    // 2. Decrement spots_filled on opportunities
    const { data: opp } = await admin.from("opportunities").select("spots_filled").eq("id", opportunityId).single();
    if (opp && (opp.spots_filled || 0) > 0) {
      await admin.from("opportunities").update({ spots_filled: opp.spots_filled - 1 }).eq("id", opportunityId);
    }

    return { success: true, message: "Registration cancelled successfully!" };
  } catch (err: any) {
    console.error("Unhandled error in cancelApplicationAction:", err);
    return { error: err?.message || "Failed to cancel registration" };
  }
}

export async function getApplicationsForOpportunityAction(opportunityId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        volunteer_id,
        opportunity_id,
        profiles (
          id,
          full_name,
          email,
          avatar_url,
          total_hours
        )
      `)
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching opportunity applications:", error);
      return { error: error.message, applications: [] };
    }

    return { success: true, applications: data || [] };
  } catch (err: any) {
    console.error("Unhandled error in getApplicationsForOpportunityAction:", err);
    return { error: err?.message || "Failed to load applications", applications: [] };
  }
}
