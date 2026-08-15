import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth/types";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/auth/authenticate", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
  unauthorisedResponse: () => Response.json({ error: "Unauthorized" }, { status: 401 }),
  forbiddenResponse: () => Response.json({ error: "Forbidden" }, { status: 403 }),
  badResponse: (result: { error?: { issues?: unknown } }, error: string) =>
    Response.json({ error, issues: result.error?.issues }, { status: 400 }),
}));
vi.mock("@/lib/supabase/consultations/service", () => ({
  default: { update: mocks.update },
}));

import { PATCH } from "./route";

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
  new Request("http://localhost/api/consultations/consultation-1", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
const context = { params: Promise.resolve({ id: "consultation-1" }) };

describe("PATCH /api/consultations/:id", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    [null, 401],
    [{ ...student, role: "admin" as const }, 403],
  ])("rejects an unauthorised user", async (currentUser, status) => {
    mocks.getAuthenticatedUser.mockResolvedValue(currentUser);

    expect((await PATCH(request(validBody), context)).status).toBe(status);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("returns 400 without calling the service for invalid input", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue(student);

    const response = await PATCH(request({ ...validBody, reason: "" }), context);

    expect(response.status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("updates the URL id for the authenticated user", async () => {
    const updated = { id: "consultation-1", userId: student.id, ...validBody };
    mocks.getAuthenticatedUser.mockResolvedValue(student);
    mocks.update.mockResolvedValue(updated);

    const response = await PATCH(request(validBody), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
    expect(mocks.update).toHaveBeenCalledWith(student.id, "consultation-1", validBody);
  });
});
