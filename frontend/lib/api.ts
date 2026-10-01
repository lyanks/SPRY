import { z } from "zod";

export function apiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL ?? "http://backend:8000";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(0, "Could not reach the API");
  }

  if (!response.ok) {
    const detail = await response
      .json()
      .then((body) => (typeof body?.detail === "string" ? body.detail : null))
      .catch(() => null);
    throw new ApiError(
      response.status,
      detail ?? `Request failed (${response.status})`,
    );
  }

  if (response.status === 204) {
    return schema.parse(undefined);
  }
  return schema.parse(await response.json());
}

/* --- Meeting schemas mirroring PROJECT.md --- */

export const meetingSchema = z.object({
  id: z.number(),
  title: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  attendee_count: z.number().int(),
});

export const meetingListSchema = z.array(meetingSchema);

export const meetingInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  starts_at: z.string().min(1, "Start time is required"),
  ends_at: z.string().min(1, "End time is required"),
  attendee_count: z.coerce.number().int().min(1, "Must have at least 1 attendee"),
});

export const healthSchema = z.object({
  status: z.string(),
});

export type Meeting = z.infer<typeof meetingSchema>;
export type MeetingInput = z.infer<typeof meetingInputSchema>;
export type Health = z.infer<typeof healthSchema>;

/* --- endpoints --- */

export const api = {
  health: () => request("/health", healthSchema),

  listMeetings: () => request("/api/meetings", meetingListSchema),

  createMeeting: (payload: MeetingInput) =>
    request("/api/meetings", meetingSchema, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
