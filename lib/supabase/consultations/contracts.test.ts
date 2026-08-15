import { describe, expect, it } from "vitest";
import {
  changeStatusSchema,
  createConsultationSchema,
  editConsultationSchema,
} from "./contracts";
import { ConsultationStatus } from "./types";

const validConsultation = {
  firstName: "Jane",
  lastName: "Student",
  reason: "Course planning",
  consultationAt: "2026-08-15T10:30:00+10:00",
};

describe("consultation contracts", () => {
  it("accepts and trims a valid consultation", () => {
    const result = createConsultationSchema.parse({
      ...validConsultation,
      firstName: "  Jane  ",
      reason: "  Course planning  ",
    });

    expect(result.firstName).toBe("Jane");
    expect(result.reason).toBe("Course planning");
  });

  it.each([createConsultationSchema, editConsultationSchema])(
    "rejects blank fields, invalid datetimes, and unknown fields",
    (schema) => {
      expect(
        schema.safeParse({ ...validConsultation, reason: "   " }).success,
      ).toBe(false);
      expect(
        schema.safeParse({ ...validConsultation, consultationAt: "tomorrow" })
          .success,
      ).toBe(false);
      expect(
        schema.safeParse({ ...validConsultation, userId: "chosen-by-client" })
          .success,
      ).toBe(false);
    },
  );

  it("enforces field length limits", () => {
    expect(
      createConsultationSchema.safeParse({
        ...validConsultation,
        firstName: "a".repeat(101),
      }).success,
    ).toBe(false);
    expect(
      createConsultationSchema.safeParse({
        ...validConsultation,
        reason: "a".repeat(201),
      }).success,
    ).toBe(false);
  });

  it.each(Object.values(ConsultationStatus))("accepts status %s", (status) => {
    expect(changeStatusSchema.parse({ status })).toEqual({ status });
  });

  it("rejects unknown statuses and additional fields", () => {
    expect(changeStatusSchema.safeParse({ status: "pending" }).success).toBe(
      false,
    );
    expect(
      changeStatusSchema.safeParse({
        status: ConsultationStatus.SCHEDULED,
        userId: "someone-else",
      }).success,
    ).toBe(false);
  });
});
