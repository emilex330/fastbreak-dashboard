import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

/**
 * Edge middleware that protects routes and redirects based on auth state.
 * Uses Supabase server client with cookie adapter tied to NextResponse.
 */
export async function middleware(req: NextRequest) {
  // Create the mutable NextResponse so we can set/delete cookies if needed
  const res = NextResponse.next();

  // Initialize Supabase server client using environment keys and a cookie adapter.
  // The adapter reads cookies from the incoming request and writes them to the response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          // Read a cookie from the incoming NextRequest
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Set a cookie on the outgoing NextResponse
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          // Remove a cookie from the outgoing response
          res.cookies.delete(name);
        },
      },
    }
  );

  // Retrieve the currently authenticated user (if any)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Public routes that do not require authentication
  const publicRoutes = ["/", "/login", "/signup", "/auth/callback"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user is not authenticated and tries to access a protected route, redirect to landing page
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user is authenticated, prevent access to auth pages (login/signup) and send to dashboard
  if (user && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Otherwise continue to the requested route
  return res;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup", "/auth/callback"],
};