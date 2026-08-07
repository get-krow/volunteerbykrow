import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ["/volunteer", "/organization", "/admin"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Role-based redirects and boundary enforcement for authenticated users
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "volunteer";

    const authPaths = ["/login", "/register", "/forgot-password"];
    const isAuthPage = authPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = role === "organization" ? "/organization" : role === "admin" ? "/admin" : "/volunteer";
      return NextResponse.redirect(url);
    }

    // Prevent organization accounts from ending up on volunteer dashboard
    if (request.nextUrl.pathname.startsWith("/volunteer") && role === "organization") {
      const url = request.nextUrl.clone();
      url.pathname = "/organization";
      return NextResponse.redirect(url);
    }

    // Prevent volunteer accounts from accessing organization dashboard
    if (request.nextUrl.pathname.startsWith("/organization") && role !== "organization" && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/volunteer";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
