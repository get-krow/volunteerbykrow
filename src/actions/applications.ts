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

export async function verifyAttendanceAction(applicationId: string, volunteerId?: string, opportunityId?: string, hours?: number) {
  try {
    const admin = createAdminClient();

    // 1. Resolve application details if volunteerId or opportunityId is missing
    let targetVolunteerId = volunteerId;
    let targetOpportunityId = opportunityId;

    const { data: app } = await admin
      .from("applications")
      .select("id, volunteer_id, opportunity_id, status")
      .eq("id", applicationId)
      .maybeSingle();

    if (app) {
      if (!targetVolunteerId) targetVolunteerId = app.volunteer_id;
      if (!targetOpportunityId) targetOpportunityId = app.opportunity_id;
    }

    if (!targetVolunteerId || !targetOpportunityId) {
      return { error: "Could not identify volunteer or opportunity for attendance verification." };
    }

    // 2. Update application status to approved in Supabase
    await admin
      .from("applications")
      .update({ status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", applicationId);

    // 3. Get opportunity details for volunteer_hours and org ID
    const { data: opp } = await admin
      .from("opportunities")
      .select("organization_id, volunteer_hours")
      .eq("id", targetOpportunityId)
      .maybeSingle();

    const verifiedHours = hours || opp?.volunteer_hours || 4;
    let orgId = opp?.organization_id;

    if (!orgId) {
      const { data: firstOrg } = await admin.from("organizations").select("id").limit(1).maybeSingle();
      orgId = firstOrg?.id || null;
    }

    // 4. Upsert into volunteer_hours table
    const { data: existingVh } = await admin
      .from("volunteer_hours")
      .select("id")
      .eq("volunteer_id", targetVolunteerId)
      .eq("opportunity_id", targetOpportunityId)
      .maybeSingle();

    if (existingVh) {
      await admin
        .from("volunteer_hours")
        .update({
          hours: verifiedHours,
          status: "approved",
          notes: "Attendance verified by organization",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingVh.id);
    } else {
      await admin.from("volunteer_hours").insert({
        volunteer_id: targetVolunteerId,
        opportunity_id: targetOpportunityId,
        organization_id: orgId,
        hours: verifiedHours,
        date: new Date().toISOString().split("T")[0],
        status: "approved",
        notes: "Attendance verified by organization",
      });
    }

    // 5. Recalculate total verified hours for volunteer profile
    const { data: allVh } = await admin
      .from("volunteer_hours")
      .select("hours")
      .eq("volunteer_id", targetVolunteerId)
      .in("status", ["approved", "verified"]);

    const sumApproved = allVh && allVh.length > 0
      ? allVh.reduce((acc, curr) => acc + (parseFloat(curr.hours) || 0), 0)
      : verifiedHours;

    await admin
      .from("profiles")
      .update({ total_hours: sumApproved })
      .eq("id", targetVolunteerId);

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
      start_date: params.eventDate ? `${params.eventDate}T12:00:00.000Z` : new Date().toISOString(),
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

    // 2. Delete any volunteer_hours entry for this opportunity & volunteer
    await admin.from("volunteer_hours").delete().eq("opportunity_id", opportunityId).eq("volunteer_id", user.id);

    // 3. Recalculate total hours for volunteer
    const { data: vhRows } = await admin
      .from("volunteer_hours")
      .select("hours")
      .eq("volunteer_id", user.id)
      .eq("status", "approved");

    const totalHours = (vhRows || []).reduce((acc, curr) => acc + Number(curr.hours || 0), 0);
    await admin.from("profiles").update({ total_hours: totalHours }).eq("id", user.id);

    // 4. Decrement spots_filled on opportunities
    const { data: opp } = await admin.from("opportunities").select("spots_filled").eq("id", opportunityId).maybeSingle();
    if (opp && (opp.spots_filled || 0) > 0) {
      await admin.from("opportunities").update({ spots_filled: Math.max(0, (opp.spots_filled || 0) - 1) }).eq("id", opportunityId);
    }

    return { success: true, message: "Registration cancelled successfully!" };
  } catch (err: any) {
    console.error("Unhandled error in cancelApplicationAction:", err);
    return { error: err?.message || "Failed to cancel application" };
  }
}

export async function getVolunteerHoursHistoryAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { totalHours: 0, history: [] };
    }

    const admin = createAdminClient();

    // 1. Fetch approved applications
    const { data: apps } = await admin
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        opportunity_id,
        opportunities (
          id,
          title,
          start_date,
          volunteer_hours,
          organizations (
            id,
            name
          )
        )
      `)
      .eq("volunteer_id", user.id)
      .eq("status", "approved");

    // 2. Fetch volunteer_hours rows
    const { data: vh } = await admin
      .from("volunteer_hours")
      .select(`
        id,
        hours,
        date,
        status,
        created_at,
        opportunity_id,
        opportunities (
          id,
          title,
          start_date,
          volunteer_hours,
          organizations (
            id,
            name
          )
        )
      `)
      .eq("volunteer_id", user.id);

    // Merge both sources seamlessly to guarantee zero lost hours
    const historyMap = new Map();

    (apps || []).forEach((a: any) => {
      const opp = a.opportunities || {};
      const org = opp.organizations || {};
      const hrs = Number(opp.volunteer_hours || 4);
      historyMap.set(opp.id || a.id, {
        id: a.id,
        event: opp.title || "Volunteer Event",
        org: org.name || "Verified Organization",
        date: opp.start_date ? new Date(opp.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        hours: hrs,
        status: "approved",
      });
    });

    (vh || []).forEach((h: any) => {
      const opp = h.opportunities || {};
      const org = opp.organizations || {};
      const hrs = Number(h.hours || opp.volunteer_hours || 4);
      historyMap.set(h.opportunity_id || h.id, {
        id: h.id,
        event: opp.title || "Volunteer Event",
        org: org.name || "Verified Organization",
        date: h.date ? new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        hours: hrs,
        status: h.status || "approved",
      });
    });

    const combinedHistory = Array.from(historyMap.values());
    const totalSum = combinedHistory.reduce((acc, item) => acc + item.hours, 0);

    // Update profiles total_hours
    await admin.from("profiles").update({ total_hours: totalSum }).eq("id", user.id);

    return { success: true, totalHours: totalSum, history: combinedHistory };
  } catch (err: any) {
    console.error("Error in getVolunteerHoursHistoryAction:", err);
    return { totalHours: 0, history: [] };
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
