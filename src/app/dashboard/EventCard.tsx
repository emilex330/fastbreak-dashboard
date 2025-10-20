"use client";

import { Button } from "@/components/ui/button";
import EventForm from "./EventForm";
import { Pencil, Trash2 } from "lucide-react";

export default function EventCard({
  event,
  onDelete,
  onUpdated,
  currentUserId,
}: {
  event: any;
  onDelete: () => void;
  onUpdated: () => void;
  currentUserId: string | null;
}) {
  const isOwner = event.user_id === currentUserId;

  // 🕒 Convert UTC date from DB to local time for display
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-white space-y-2 transition hover:shadow-md hover:scale-[1.01] duration-150">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{event.name}</h3>
        <span className="text-sm text-gray-500">{event.sport}</span>
      </div>

      <p className="text-gray-600 text-sm">{event.description}</p>
      <p className="text-gray-500 text-xs">
        📅 {formattedDate} — 🕒 {formattedTime}
      </p>
      <p className="text-gray-500 text-xs">🏟️ {event.venues.join(", ")}</p>

      {isOwner && (
        <div className="flex gap-2 pt-2">
          {/* Edit button */}
          <EventForm
            event={event}
            onSuccess={onUpdated}
            trigger={
              <Button
                size="icon"
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.97]"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            }
          />

          {/* Delete button */}
          <Button
            size="icon"
            onClick={onDelete}
            className="border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.97]"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
          </Button>
        </div>
      )}
    </div>
  );
}