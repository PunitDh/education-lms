import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth/types";
import { ConsultationStatus } from "@/lib/supabase/consultations/types";

const mocks = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  changeStatus: vi.fn(),
}));

vi.mock("@/lib/auth/authenticate", () => ({
  getAuthenticatedUser: mocks.getAuthenticatedUser,
  unauthorisedResponse: () => Response.json({ error: "Unauthorized" }, { status: 401 }),
  forbiddenResponse: () => Response.json({ error: "Forbidden" }, { status: 403 }),
  badResponse: (result: { error?: { issues?: unknown } }, error: string) =>
    Response.json({ error, issues: result.error?.issues }, { status: 400 }),
}));
vi.mock("@/lib/supabase/consultations/service", () => ({
  default: { changeStatus: mocks.changeStatus },
}));

import { PATCH } from "./route";

const student: CurrentUser = {
  id: "student-1",
  email: "student@example.com",
  firstName: "Jane",
  lastName: "Student",
  role: "student",
};
const request = (body: unknown) =>
  new Request("http://localhost/api/consultations/consultation-1/change-status", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
const context = { params: Promise.resolve({ id: "consultation-1" }) };

describe("PATCH /api/consultations/:id/change-status", () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    [null, 401],
    [{ ...student, role: "admin" as const }, 403],
  ])("rejects an unauthorised user", async (currentUser, status) => {
    mocks.getAuthenticatedUser.mockResolvedValue(currentUser);

    expect(
      (await PATCH(request({ status: ConsultationStatus.COMPLETED }), context)).status,
    ).toBe(status);
    expect(mocks.changeStatus).not.toHaveBeenCalled();
  });

  it("rejects invalid statuses and additional fields", async () => {
    mocks.getAuthenticatedUser.mockResolvedValue(student);

    const response = await PATCH(
      request({ status: "pending", userId: "another-user" }),
      context,
    );

    expect(response.status).toBe(400);
    expect(mocks.changeStatus).not.toHaveBeenCalled();
  });

  it("changes status using the authenticated user and URL id", async () => {
    const updated = {
      id: "consultation-1",
      userId: student.id,
      status: ConsultationStatus.COMPLETED,
    };
    mocks.getAuthenticatedUser.mockResolvedValue(student);
    mocks.changeStatus.mockResolvedValue(updated);

    const response = await PATCH(
      request({ status: ConsultationStatus.COMPLETED }),
      context,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(updated);
    expect(mocks.changeStatus).toHaveBeenCalledWith(
      student.id,
      "consultation-1",
      ConsultationStatus.COMPLETED,
    );
  });
});
