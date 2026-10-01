"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { api, meetingInputSchema, type MeetingInput } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MeetingFormDialogProps {
  onSuccess: () => void;
}

export function MeetingFormDialog({ onSuccess }: MeetingFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const now = new Date();
  const defaultStart = new Date(now.getTime() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 90 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const form = useForm<MeetingInput>({
    resolver: zodResolver(meetingInputSchema),
    defaultValues: {
      title: "",
      starts_at: defaultStart,
      ends_at: defaultEnd,
      attendee_count: 2,
    },
  });

  async function onSubmit(values: MeetingInput) {
    setIsSubmitting(true);
    try {
      // Ensure ISO format with UTC timezone
      const payload: MeetingInput = {
        title: values.title,
        starts_at: new Date(values.starts_at).toISOString(),
        ends_at: new Date(values.ends_at).toISOString(),
        attendee_count: Number(values.attendee_count),
      };

      await api.createMeeting(payload);
      toast.success("Meeting created successfully");
      form.reset({
        title: "",
        starts_at: defaultStart,
        ends_at: defaultEnd,
        attendee_count: 2,
      });
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create meeting");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#EC7211] hover:bg-[#d5630a] text-white font-medium shadow-sm transition-colors">
          <Plus className="mr-2 h-4 w-4" /> Add Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Schedule New Meeting
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Add a meeting to Spry to track meeting time and attendee analytics.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Meeting Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Weekly Product Sync"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500 font-medium">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="starts_at" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Starts At
              </Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...form.register("starts_at")}
              />
              {form.formState.errors.starts_at && (
                <p className="text-xs text-red-500 font-medium">
                  {form.formState.errors.starts_at.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ends_at" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Ends At
              </Label>
              <Input
                id="ends_at"
                type="datetime-local"
                {...form.register("ends_at")}
              />
              {form.formState.errors.ends_at && (
                <p className="text-xs text-red-500 font-medium">
                  {form.formState.errors.ends_at.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="attendee_count" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Attendee Count
            </Label>
            <Input
              id="attendee_count"
              type="number"
              min={1}
              max={500}
              {...form.register("attendee_count")}
            />
            {form.formState.errors.attendee_count && (
              <p className="text-xs text-red-500 font-medium">
                {form.formState.errors.attendee_count.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#EC7211] hover:bg-[#d5630a] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Save Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
