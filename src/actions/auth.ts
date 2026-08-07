"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validators/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  const redirectTo = formData.get("redirectTo")?.toString() || "/volunteer";
  redirect(redirectTo);
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const full_name = formData.get("full_name")?.toString();
  const role = formData.get("role")?.toString() || "volunteer";
  const birthdate = formData.get("birthdate")?.toString();
  const country = formData.get("country")?.toString();
  const province_state = formData.get("province_state")?.toString();
  const city = formData.get("city")?.toString();
  const registering_for = formData.get("registering_for")?.toString() || "myself";
  const description = formData.get("description")?.toString();

  if (!email || !password || !full_name) {
    return { error: "Please fill in all required fields." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role,
        birthdate,
        country,
        province_state,
        city,
        registering_for,
        description,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email to verify your account." };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_user_account");
  if (error) {
    // Fallback: sign out user if RPC function is pending execution
    await supabase.auth.signOut();
  } else {
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for a password reset link." };
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
