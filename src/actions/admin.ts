"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const SECRET_ADMIN_PASSWORD = "WackoZacko098!";

export async function verifyAdminPasswordAction(password: string) {
  if (password === SECRET_ADMIN_PASSWORD) {
    return { success: true };
  }
  return { error: "Invalid Admin Password. Access Denied." };
}

export async function getAllOrganizationsAdminAction() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching organizations for admin:", error);
      return { error: error.message, organizations: [] };
    }

    return { success: true, organizations: data || [] };
  } catch (err: any) {
    return { error: err?.message || "Failed to fetch organizations", organizations: [] };
  }
}

export async function toggleOrganizationVerificationAction(orgId: string, status: "verified" | "unverified" | "pending") {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("organizations")
      .update({
        verification_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orgId);

    if (error) {
      console.error("Error updating organization verification status:", error);
      return { error: error.message };
    }

    revalidatePath("/krow");
    revalidatePath("/admin");
    revalidatePath("/organization");
    revalidatePath("/opportunities");

    return { success: true, message: `Organization status updated to ${status.toUpperCase()}!` };
  } catch (err: any) {
    return { error: err?.message || "Failed to update status" };
  }
}
