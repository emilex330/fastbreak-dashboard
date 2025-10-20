"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Helper: Create a type-safe Supabase server client
// - Uses the Supabase SSR helper to create a client that can read and set
//   cookies via Next.js server-side cookie helpers.
// - This allows Supabase auth/session handling to work in server Actions/SSR.
function createSupabaseServerClient() {
  return createServerClient(
    // Public URL for the Supabase project (client-side safe)
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Service role key for server-side privileges (must be kept secret)
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      // Provide cookie adapter so supabase-js can persist auth cookies
      cookies: {
        // Return an array of { name, value } for all cookies (or filtered by name)
        getAll: async (name?: string) => {
          // cookies() gives us a stable cookie store in Next.js server context
          const cookieStore = await cookies();
          const all = cookieStore.getAll();
          // Map Next.js cookie objects to the shape expected by supabase
          const mapped = all.map((c) => ({ name: c.name, value: c.value }));
          if (typeof name === "undefined") return mapped;
          // If a name was provided, only return matching cookies
          return mapped.filter((c) => c.name === name);
        },
        // Set cookies provided by supabase; each cookie may include options
        setAll: async (cookieList: Array<{ name: string; value: string; options?: any }>) => {
          const cookieStore = await cookies();
          // next/headers cookie store accepts (name, value, options)
          cookieList.forEach((c) => {
            cookieStore.set(c.name, c.value, c.options);
          });
        },
      },
    }
  );
}

// Zod schema for validating event payloads coming into our actions.
// Using Zod ensures type-safety and provides helpful validation errors.
const EventSchema = z.object({
  id: z.string().uuid().optional(), // id is optional for create but required for update/delete
  name: z.string().min(1, "Event name is required"),
  sport: z.string().min(1, "Sport is required"),
  date: z.string().min(1, "Date is required"), // storing date as string (ISO recommended)
  description: z.string().optional(),
  venues: z.array(z.string()).min(1, "At least one venue required"),
});

export type EventData = z.infer<typeof EventSchema>;

/* -------------------------------------------------------------------------- */
/*                               CREATE EVENT                              */
/* -------------------------------------------------------------------------- */

// Create a new event associated with the currently authenticated user.
// - Validates incoming data with Zod
// - Ensures there's an authenticated user via Supabase auth
// - Inserts the record into the "events" table with user_id set
export async function createEvent(data: EventData) {
  const supabase = createSupabaseServerClient();

  // Retrieve the current user from the Supabase auth session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // If no user or an auth error, prevent the action
  if (userError || !user) throw new Error("Unauthorized");

  // Validate incoming data (throws if invalid)
  const parsed = EventSchema.parse(data);

  // Insert a new event row and attach the user's id
  const { error } = await supabase.from("events").insert({
    user_id: user.id,
    ...parsed,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*                                GET EVENTS                               */
/* -------------------------------------------------------------------------- */

import { createClient } from "@/lib/supabase/server";

// Fetch events with optional filters (search and sport).
// - Uses a server-side supabase client (createClient) that likely reads session
//   from cookies (implementation in "@/lib/supabase/server").
// - Returns events and the current user's id (so the UI can identify ownership).
export async function getEvents({ search = "", sport = "" }) {
  // createClient is expected to return a Supabase client configured for the server.
  const supabase = await createClient();

  // Get current user to include currentUserId in the response
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // List of known sports — used to implement an "Other" filter.
  const knownSports = [
    "Soccer",
    "Basketball",
    "Tennis",
    "Baseball",
    "Volleyball",
    "Hockey",
    "Cricket",
    "Rugby",
    "Golf",
    "Swimming",
    "Track",
  ];

  // Base query: select all columns and order by date ascending
  let query = supabase.from("events").select("*").order("date", { ascending: true });

  // If a search term is provided, filter event names case-insensitively
  if (search) query = query.ilike("name", `%${search}%`);

  // Sport filter handling:
  // - If sport === "Other", exclude known sports (case-insensitive)
  // - Otherwise, match the sport case-insensitively
  if (sport) {
    const normalizedSport = sport.trim().toLowerCase();

    if (normalizedSport === "other") {
      // Supabase/PostgREST accepts "not ... in (...)"
      // We construct a Postgres IN list from the knownSports array.
      // Note: this comparison is case-sensitive on the DB unless the column is lowercased.
      // If sport values in DB have different casing, consider storing normalized values
      // or using a case-insensitive expression.
      query = query.not(
        "sport",
        "in",
        `(${knownSports.map((s) => `'${s}'`).join(",")})`
      );
    } else {
      // ilike for case-insensitive match against the provided sport string
      query = query.ilike("sport", normalizedSport);
    }
  }

  // Execute the composed query
  const { data: events, error } = await query;

  if (error) throw new Error(error.message);

  // Return fetched events and the current user's id (or null if unauthenticated)
  return { events, currentUserId: user?.id ?? null };
}

/* -------------------------------------------------------------------------- */
/*                               UPDATE EVENT                              */
/* -------------------------------------------------------------------------- */

// Update an existing event:
// - Validates payload
// - Requires authenticated user and event id
// - Ensures the update only affects events owned by the current user
export async function updateEvent(data: EventData) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  // Validate event payload
  const parsed = EventSchema.parse(data);
  if (!parsed.id) throw new Error("Event ID required for update");

  // Update permitted fields; restrict update to rows that match id and user_id
  const { error } = await supabase
    .from("events")
    .update({
      name: parsed.name,
      sport: parsed.sport,
      date: parsed.date,
      description: parsed.description,
      venues: parsed.venues,
    })
    .eq("id", parsed.id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*                               DELETE EVENT                              */
/* -------------------------------------------------------------------------- */

// Delete an event by id, only if it belongs to the authenticated user.
export async function deleteEvent(id: string) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  // Delete row where id matches and is owned by the current user
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return { success: true };
}