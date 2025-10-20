"use client";

import { useEffect, useState, useTransition } from "react";
import { getEvents, deleteEvent } from "./actions/eventActions";
import EventForm from "./EventForm";
import EventCard from "./EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    "Other",
  ];

  const fetchEvents = async () => {
    startTransition(async () => {
      try {
        const { events, currentUserId } = await getEvents({ search, sport });
        const filtered =
          sport.toLowerCase() === "other"
            ? events.filter(
                (e: any) =>
                  !knownSports
                    .map((s) => s.toLowerCase())
                    .includes(e.sport?.toLowerCase() ?? "")
              )
            : events;
        setEvents(filtered);
        setCurrentUserId(currentUserId);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  // ✅ Fetch user info for display
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      const user = data.user;
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User";
      setUsername(displayName);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [search, sport]);

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      try {
        await deleteEvent(id);
        toast.success("Event deleted");
        fetchEvents();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 sm:px-10 md:px-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Emil&apos;s Events Dashboard</h1>

        <div className="flex items-center gap-4">
          {username && (
            <span className="text-gray-600 font-medium">Hi, {username}</span>
          )}
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] hover:bg-red-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Add Event Button */}
      <EventForm onSuccess={fetchEvents} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs cursor-text"
        />

        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="border border-gray-300 rounded-md p-2 cursor-pointer hover:border-blue-400 transition-all duration-200"
        >
          <option value="">All Sports</option>
          {knownSports.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Spinner */}
      {isPending && (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      )}

      {/* Events Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-6 md:px-10">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            currentUserId={currentUserId}
            onDelete={() => handleDelete(event.id)}
            onUpdated={fetchEvents}
          />
        ))}
      </div>

      {/* Empty State */}
      {events.length === 0 && !isPending && (
        <p className="text-gray-500 text-center pt-10">No events found.</p>
      )}
    </div>
  );
}