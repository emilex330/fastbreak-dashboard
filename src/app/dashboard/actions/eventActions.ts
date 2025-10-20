"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Helper: Create a type-safe Supabase server client
function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: async (name?: string) => {
          const cookieStore = await cookies();
          const all = cookieStore.getAll();
          const mapped = all.map((c) => ({ name: c.name, value: c.value }));
          if (typeof name === "undefined") return mapped;
          return mapped.filter((c) => c.name === name);
        },
        setAll: async (
          cookieList: Array<{ name: string; value: string; options?: any }>
        ) => {
          const cookieStore = await cookies();
          cookieList.forEach((c) => {
            cookieStore.set(c.name, c.value, c.options);
          });
        },
      },
    }
  );
}

const EventSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Event name is required"),
  sport: z.string().min(1, "Sport is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  venues: z.array(z.string()).min(1, "At least one venue required"),
});

export type EventData = z.infer<typeof EventSchema>;

/* -------------------------------------------------------------------------- */
/*                               CREATE EVENT                                 */
/* -------------------------------------------------------------------------- */

export async function createEvent(data: EventData) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error("Unauthorized");

  const parsed = EventSchema.parse(data);

  const { error } = await supabase.from("events").insert({
    user_id: user.id,
    ...parsed,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

/* -------------------------------------------------------------------------- */
/*                                GET EVENTS                                  */
/* -------------------------------------------------------------------------- */

export async function getEvents({ search = "", sport = "" }) {
  console.log("🪶 getEvents() called");

  const supabase = createSupabaseServerClient();
  console.log("✅ Supabase client created");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  console.log("👤 Supabase user check:", { user, userError });

  // Proceed only if user exists
  if (userError || !user) {
    console.log("🚫 No user found or auth error");
    throw new Error("Unauthorized");
  }

  let query = supabase.from("events").select("*").order("date", { ascending: true });
  const { data: events, error } = await query;

  console.log("📦 Supabase query result:", { events, error });
  if (error) throw new Error(error.message);

  return { events, currentUserId: user?.id ?? null };
}

/* -------------------------------------------------------------------------- */
/*                               UPDATE EVENT                                 */
/* -------------------------------------------------------------------------- */

export async function updateEvent(data: EventData) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const parsed = EventSchema.parse(data);
  if (!parsed.id) throw new Error("Event ID required for update");

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
/*                               DELETE EVENT                                 */
/* -------------------------------------------------------------------------- */

export async function deleteEvent(id: string) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  return { success: true };
}