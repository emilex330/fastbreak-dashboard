"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createEvent, updateEvent } from "./actions/eventActions";

// 🕒 Helper: Format Date object as local datetime string for datetime-local input
function toLocalISOString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Event name is required"),
  sport: z.string().min(1, "Sport type is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  venues: z.string().min(1, "At least one venue is required"),
});

export default function EventForm({
  event,
  onSuccess,
  trigger,
}: {
  event?: any;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(event);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: event?.name || "",
      sport: event?.sport || "",
      date: event?.date
        ? toLocalISOString(new Date(event.date))
        : toLocalISOString(new Date()),
      description: event?.description || "",
      venues: Array.isArray(event?.venues)
        ? event.venues.join(", ")
        : event?.venues || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: event?.name || "",
        sport: event?.sport || "",
        date: event?.date
          ? toLocalISOString(new Date(event.date))
          : toLocalISOString(new Date()),
        description: event?.description || "",
        venues: Array.isArray(event?.venues)
          ? event.venues.join(", ")
          : event?.venues || "",
      });
    }
  }, [open, event, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Convert local datetime to UTC before saving
      const utcDate = new Date(values.date);
      const payload = {
        ...values,
        id: event?.id,
        date: utcDate.toISOString(),
        venues: values.venues.split(",").map((v) => v.trim()),
      };

      if (isEdit) {
        await updateEvent(payload);
        toast.success("Event updated!");
      } else {
        await createEvent(payload);
        toast.success("Event created!");
      }

      onSuccess();
      form.reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const minDate = toLocalISOString(new Date());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Floating Add Event Button */}
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            className="rounded-full fixed bottom-8 right-8 shadow-lg z-50 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 cursor-pointer hover:scale-[1.05] active:scale-[0.97]"
          >
            + Add Event
          </Button>
        )}
      </DialogTrigger>

      {/* Dialog box styling */}
      <DialogContent className="max-w-md bg-white rounded-2xl shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900 text-lg font-semibold">
            {isEdit ? "Edit Event" : "Create Event"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Event Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Champions League Final"
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sport */}
            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Sport Type
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Soccer"
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Date & Time (local)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      min={minDate}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Event details..."
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Venues */}
            <FormField
              control={form.control}
              name="venues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Venues
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Separate multiple venues with commas"
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
              >
                {isEdit ? "Save Changes" : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}