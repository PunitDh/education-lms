import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth/types";
import type { Consultation } from "./types";
import { ConsultationStatus } from "./types";

const repository = vi.hoisted(() => ({
  all: vi.fn(),
  where: vi.fn(),
  findByIdForUser: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  changeStatus: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("./repository", () => ({ default: repository }));

import consultationService from "./service";

const consultation = (
  status: ConsultationStatus = ConsultationStatus.SCHEDULED,
): Consultation => ({
  id: "consultation-1",
  userId: "student-1",
  firstName: "Jane",
  lastName: "Student",
  reason: "Course planning",
  consultationAt: "2026-08-15T00:30:00.000Z",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  status,
});

const user = (role: CurrentUser["role"]): CurrentUser => ({
  id: role === "admin" ? "admin-1" : "student-1",
  email: `${role}@example.com`,
  firstName: "Test",
  lastName: "User",
  role,
});

describe("consultation service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("fetches every consultation for an admin", async () => {
    repository.all.mockResolvedValue([consultation()]);

    await expect(
      consultationService.fetchForUser(user("admin")),
    ).resolves.toEqual([consultation()]);
    expect(repository.all).toHaveBeenCalledOnce();
    expect(repository.where).not.toHaveBeenCalled();
  });

  it("fetches only a student's consultations", async () => {
    repository.where.mockResolvedValue([consultation()]);

    await consultationService.fetchForUser(user("student"));

    expect(repository.where).toHaveBeenCalledWith({ userId: "student-1" });
    expect(repository.all).not.toHaveBeenCalled();
  });

  it.each([ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED])(
    "allows scheduled consultations to become %s",
    async (nextStatus) => {
      const updated = consultation(nextStatus);
      repository.findByIdForUser.mockResolvedValue(consultation());
      repository.changeStatus.mockResolvedValue(updated);

      await expect(
        consultationService.changeStatus(
          "student-1",
          "consultation-1",
          nextStatus,
        ),
      ).resolves.toEqual(updated);
      expect(repository.changeStatus).toHaveBeenCalledWith(
        "student-1",
        "consultation-1",
        nextStatus,
      );
    },
  );

  it("allows completed consultations to return to scheduled", async () => {
    repository.findByIdForUser.mockResolvedValue(
      consultation(ConsultationStatus.COMPLETED),
    );
    repository.changeStatus.mockResolvedValue(consultation());

    await consultationService.changeStatus(
      "student-1",
      "consultation-1",
      ConsultationStatus.SCHEDULED,
    );

    expect(repository.changeStatus).toHaveBeenCalledOnce();
  });

  it.each([
    [ConsultationStatus.SCHEDULED, ConsultationStatus.SCHEDULED],
    [ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED],
    [ConsultationStatus.CANCELLED, ConsultationStatus.SCHEDULED],
    [ConsultationStatus.CANCELLED, ConsultationStatus.COMPLETED],
  ])(
    "rejects a transition from %s to %s",
    async (currentStatus, nextStatus) => {
      repository.findByIdForUser.mockResolvedValue(consultation(currentStatus));

      await expect(
        consultationService.changeStatus(
          "student-1",
          "consultation-1",
          nextStatus,
        ),
      ).rejects.toThrow(
        `Cannot change consultation from ${currentStatus} to ${nextStatus}`,
      );
      expect(repository.changeStatus).not.toHaveBeenCalled();
    },
  );

  it("updates a scheduled consultation for its user", async () => {
    const changes = {
      firstName: "Jane",
      lastName: "Student",
      reason: "New reason",
      consultationAt: "2026-08-16T00:30:00.000Z",
    };
    repository.findByIdForUser.mockResolvedValue(consultation());
    repository.update.mockResolvedValue({ ...consultation(), ...changes });

    await consultationService.update("student-1", "consultation-1", changes);

    expect(repository.update).toHaveBeenCalledWith(
      "student-1",
      "consultation-1",
      changes,
    );
  });

  it.each([ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED])(
    "does not edit a %s consultation",
    async (status) => {
      repository.findByIdForUser.mockResolvedValue(consultation(status));

      await expect(
        consultationService.update("student-1", "consultation-1", {
          firstName: "Jane",
          lastName: "Student",
          reason: "New reason",
          consultationAt: "2026-08-16T00:30:00.000Z",
        }),
      ).rejects.toThrow(`Cannot edit a ${status} consultation`);
      expect(repository.update).not.toHaveBeenCalled();
    },
  );
});
