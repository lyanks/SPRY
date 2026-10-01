import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, api } from "@/lib/api";

function mockFetch(body: unknown, init: { status?: number } = {}) {
  const status = init.status ?? 200;
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

afterEach(() => vi.restoreAllMocks());

describe("meetings api", () => {
  it("parses list meetings response", async () => {
    const meetings = [
      {
        id: 1,
        title: "Team Sync",
        starts_at: "2026-10-01T10:00:00Z",
        ends_at: "2026-10-01T10:30:00Z",
        attendee_count: 4,
      },
    ];
    mockFetch(meetings);
    await expect(api.listMeetings()).resolves.toEqual(meetings);
  });

  it("creates a meeting", async () => {
    const payload = {
      title: "Sprint Retro",
      starts_at: "2026-10-01T15:00:00Z",
      ends_at: "2026-10-01T16:00:00Z",
      attendee_count: 5,
    };
    mockFetch({ id: 2, ...payload });
    const result = await api.createMeeting(payload);
    expect(result.id).toBe(2);
    expect(result.title).toBe("Sprint Retro");
  });

  it("raises ApiError on failure", async () => {
    mockFetch({ detail: "Server error" }, { status: 500 });
    await expect(api.listMeetings()).rejects.toMatchObject({
      status: 500,
    });
  });
});
