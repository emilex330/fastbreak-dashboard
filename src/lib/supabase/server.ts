import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/lib/database.types";

// Create a Supabase server client that uses the Next.js cookie store for auth persistence.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}