import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth/types";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/auth/authenticate", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
  unauthorisedResponse: () => Response.json({ error: "Unauthorized" }, { status: 401 }),
  forbiddenResponse: () => Response.json({ error: "Forbidden" }, { status: 403 }),
  badResponse: (result: { error?: { issues?: unknown } }, error: string) =>
    Response.json({ error, issues: result.error?.issues }, { status: 400 }),
}));
vi.mock("@/lib/supabase/consultations/service", () => ({
  default: { create: mocks.create },
}));

import { POST } from "./route";

const student: CurrentUser = {
  id: "student-1",
  email: "student@example.com",
  firstName: "Jane",
  lastName: "Student",
  role: "student",
};
const validBody = {
  firstName: "Jane",
  lastName: "Student",
  reason: "Course planning",
  consultationAt: "2026-08-15T10:30:00+10:00",
};

const request = (body: unknown) =>
  new Request("http://localhost/api/consultations", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

describe("POST /api/consultations", () => {
  beforeEach(() => vi.resetAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue(null);

    expect((await POST(request(validBody))).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns 403 for an admin", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue({ ...student, role: "admin" });

    expect((await POST(request(validBody))).status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns validation details for an invalid or over-posted request", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue(student);

    const response = await POST(request({ ...validBody, userId: "another-user" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "Invalid consultation" });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates with the authenticated user id and returns 201", async () => {
    const created = { id: "consultation-1", userId: student.id, ...validBody };
    mocks.getAuthenticatedUser.mockResolvedValue(student);
    mocks.create.mockResolvedValue(created);

    const response = await POST(request(validBody));

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(created);
    expect(mocks.create).toHaveBeenCalledWith(student.id, validBody);
  });
});
