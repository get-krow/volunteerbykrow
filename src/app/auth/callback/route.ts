import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If an explicit redirect was provided, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Otherwise, redirect based on user role
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;
      const destination = role === "organization" ? "/organization" : "/volunteer";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
