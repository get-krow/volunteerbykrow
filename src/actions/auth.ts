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

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: error.message };
  }

  // Check user role from profiles table first, fallback to user_metadata
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role || data.user?.user_metadata?.role || "volunteer";
  const redirectTo = formData.get("redirectTo")?.toString();

  // If a specific non-dashboard redirect path was provided, use it
  if (redirectTo && !["/volunteer", "/organization", "/admin", "/login", "/register"].includes(redirectTo)) {
    redirect(redirectTo);
  }

  // Otherwise, route to the correct role dashboard
  if (role === "organization") {
    redirect("/organization");
  } else if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/volunteer");
  }
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

  if (!email || !password || !full_name) {
    return { error: "Please fill in all required fields." };
  }

  let age: number | undefined = undefined;
  if (birthdate) {
    const diff = Date.now() - new Date(birthdate).getTime();
    age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  const locationStr = [city, province_state, country].filter(Boolean).join(", ");

  const { data: authData, error } = await supabase.auth.signUp({
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
        age,
        location: locationStr,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure role and profile metadata are explicitly set in profiles table
  if (authData?.user) {
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      role: role as any,
      full_name,
      birthdate: birthdate || null,
      country: country || null,
      province_state: province_state || null,
      city: city || null,
      age: age || null,
      location: locationStr || null,
      updated_at: new Date().toISOString(),
    });
  }

  // Auto sign-in user immediately without email verification requirement
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const destination = role === "organization" ? "/organization" : "/volunteer";
  redirect(destination);
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
