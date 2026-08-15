import { describe, expect, it } from "vitest";
import type { JwtPayload } from "@supabase/supabase-js";
import { isAdmin, mapJwtToUser } from "./mapper";
import type { CurrentUser } from "./types";

const jwt = (overrides: Partial<JwtPayload> = {}): JwtPayload => ({
  iss: "http://localhost/auth/v1",
  sub: "user-1",
  aud: "authenticated",
  exp: 2_000_000_000,
  iat: 1_900_000_000,
  role: "authenticated",
  aal: "aal1",
  session_id: "session-1",
  ...overrides,
});

describe("auth mapper", () => {
  it("maps identity fields and an admin role from app metadata", () => {
    expect(
      mapJwtToUser(
        jwt({
          sub: "user-1",
          email: "admin@example.com",
          user_metadata: { firstName: "Ada", lastName: "Admin" },
          app_metadata: { role: "admin" },
        }),
      ),
    ).toEqual({
      id: "user-1",
      email: "admin@example.com",
      firstName: "Ada",
      lastName: "Admin",
      role: "admin",
    });
  });

  it("defaults missing identity data and unrecognised roles safely", () => {
    expect(
      mapJwtToUser(
        jwt({
          sub: "user-2",
          app_metadata: { role: "owner" },
        }),
      ),
    ).toEqual({
      id: "user-2",
      email: "",
      firstName: "",
      lastName: "",
      role: "student",
    });
  });

  it("identifies only admins", () => {
    expect(isAdmin({ role: "admin" } as CurrentUser)).toBe(true);
    expect(isAdmin({ role: "student" } as CurrentUser)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
