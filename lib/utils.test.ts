import { describe, expect, it } from "vitest";
import {
  cn,
  formatDateTimeDisplay,
  getUserDisplayName,
  normalizeDateTime,
} from "./utils";
import type { CurrentUser } from "./auth/types";

const user = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  id: "user-1",
  email: "student@example.com",
  firstName: "Jane",
  lastName: "Student",
  role: "student",
  ...overrides,
});

describe("utils", () => {
  it("merges conditional and conflicting Tailwind classes", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });

  it("uses a full name, then email, then an empty string for display names", () => {
    expect(getUserDisplayName(user())).toBe("Jane Student");
    expect(getUserDisplayName(user({ firstName: "", lastName: "" }))).toBe(
      "student@example.com",
    );
    expect(getUserDisplayName(undefined)).toBe("");
  });

  it("normalizes datetimes to UTC ISO strings", () => {
    expect(normalizeDateTime(new Date("2026-08-15T10:30:00+10:00"))).toBe(
      "2026-08-15T00:30:00.000Z",
    );
  });

  it("formats display datetimes in the configured Melbourne timezone", () => {
    expect(formatDateTimeDisplay("2026-08-15T00:30:00.000Z")).toMatch(
      /15 Aug 2026.*10:30 am/i,
    );
  });
});
