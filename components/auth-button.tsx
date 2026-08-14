import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LogoutButton } from "./logout-button";
import { getUserDisplayName } from "@/lib/utils";
import { getAuthenticatedUser } from "@/lib/auth/authenticate";
import { isAdmin as checkIsAdmin } from "@/lib/auth/mapper";

export async function AuthButton() {
  const user = await getAuthenticatedUser();
  const isAdmin = checkIsAdmin(user);

  return user ? (
    <div className="flex items-center gap-4">
      {isAdmin && (
        <Badge
          className="bg-red-500 text-white hover:bg-red-600"
          title="Admin accounts are read-only. Admins cannot create, edit or cancel consultations."
        >
          Admin Account
        </Badge>
      )}
      Hey, {getUserDisplayName(user)}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
