import { NextResponse } from "next/server"; // helper to form Next.js responses (including redirects)
import { createServerClient } from "@supabase/ssr"; // Supabase helper for server-side client (cookies-aware)
import { cookies } from "next/headers"; // Next.js helper to read/modify cookies from server components/route handlers
import type { NextRequest } from "next/server"; // request type for the GET handler

// GET handler invoked when OAuth provider redirects back with a code query param.
// This exchanges the authorization code for a Supabase session and then redirects
// the user to the dashboard.
export async function GET(req: NextRequest) {
  // Parse the incoming request URL to access query params and origin for redirect
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code"); // authorization code from provider

  if (code) {
    // Obtain the server-side cookie store so we can read and set cookies during the exchange
    const cookieStore = await cookies();

    // Create a Supabase server client that uses the Next.js cookie store for auth persistence.
    // Environment variables provide the Supabase URL and anon key.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // Provide cookie helpers so Supabase can read/set/remove session cookies on the server
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value; // read cookie value
          },
          set(name, value, options) {
            // set a cookie with the provided options (e.g. maxAge, path, httpOnly)
            cookieStore.set({ name, value, ...options });
          },
          remove(name, options) {
            // prefer delete() when available, otherwise clear the cookie by setting an expired value
            if (typeof (cookieStore as any).delete === "function") {
              (cookieStore as any).delete(name);
            } else {
              cookieStore.set({ name, value: "", maxAge: 0, ...options });
            }
          },
        },
      }
    );

    // Exchange the OAuth authorization code for a Supabase session (sets cookies via the helpers above)
    await supabase.auth.exchangeCodeForSession(code);
  }

  // After handling the code (or if no code present), redirect the user to the dashboard
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}