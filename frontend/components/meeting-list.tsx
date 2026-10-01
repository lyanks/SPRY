"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Users,
  RefreshCw,
  Sparkles,
  BarChart2,
  Hourglass,
} from "lucide-react";

import { api, type Meeting } from "@/lib/api";
import { MeetingFormDialog } from "@/components/meeting-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatDateTime(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: isoString, time: "" };
    const date = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { date, time, timestamp: d.getTime() };
  } catch {
    return { date: isoString, time: "", timestamp: 0 };
  }
}

export function MeetingList() {
  const {
    data: meetings,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Meeting[]>({
    queryKey: ["meetings"],
    queryFn: () => api.listMeetings(),
  });

  const totalMeetings = meetings?.length ?? 0;
  const totalMinutes =
    meetings?.reduce((acc, m) => {
      try {
        const s = new Date(m.starts_at).getTime();
        const e = new Date(m.ends_at).getTime();
        const diff = Math.max(0, Math.round((e - s) / 60000));
        return acc + (isNaN(diff) ? 0 : diff);
      } catch {
        return acc;
      }
    }, 0) ?? 0;

  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalAttendees =
    meetings?.reduce((acc, m) => acc + (m.attendee_count || 1), 0) ?? 0;
  const avgAttendees =
    totalMeetings > 0 ? (totalAttendees / totalMeetings).toFixed(1) : "0";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Meeting Analytics
            </h1>
            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
              Spry v1.0
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track meetings, attendee counts, and schedule distribution across your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-gray-600 dark:text-gray-300"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin text-orange-500" : ""}`}
            />
            Refresh
          </Button>
          <MeetingFormDialog onSuccess={() => refetch()} />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Meetings
            </CardTitle>
            <Calendar className="h-4 w-4 text-[#0073BB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {totalMeetings}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Synchronized events
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Scheduled Time
            </CardTitle>
            <Hourglass className="h-4 w-4 text-[#EC7211]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {totalHours} <span className="text-sm font-normal text-gray-500">hrs</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {totalMinutes} total meeting minutes
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Avg Attendees / Meeting
            </CardTitle>
            <Users className="h-4 w-4 text-[#1D8102]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {avgAttendees}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {totalAttendees} participants across all syncs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#0073BB]" /> Scheduled Meetings
          </h2>
          <span className="text-xs text-gray-500">
            Ordered chronologically
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm">
            <p className="font-semibold">Unable to load meetings</p>
            <p className="text-xs mt-1 opacity-90">
              {error instanceof Error ? error.message : "Failed to connect to backend service."}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 text-xs bg-white text-red-700 hover:bg-red-50"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </div>
        ) : meetings && meetings.length > 0 ? (
          <div className="grid gap-3">
            {meetings.map((meeting) => {
              const start = formatDateTime(meeting.starts_at);
              const end = formatDateTime(meeting.ends_at);
              let durationMins = 0;
              if (start.timestamp && end.timestamp) {
                durationMins = Math.max(0, Math.round((end.timestamp - start.timestamp) / 60000));
              }

              return (
                <div
                  key={meeting.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#EC7211] font-bold text-sm shrink-0 border border-orange-100 dark:border-orange-900/50">
                      #{meeting.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {meeting.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {start.date || "Upcoming"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {start.time} – {end.time}
                          {durationMins > 0 && ` (${durationMins}m)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 flex items-center gap-1 font-medium px-2.5 py-1"
                    >
                      <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      {meeting.attendee_count} {meeting.attendee_count === 1 ? "attendee" : "attendees"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 text-[#EC7211] flex items-center justify-center mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              No meetings scheduled yet
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 mb-4">
              Get started by adding your first meeting to calculate analytics.
            </p>
            <MeetingFormDialog onSuccess={() => refetch()} />
          </div>
        )}
      </div>
    </div>
  );
}
