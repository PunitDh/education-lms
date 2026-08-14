import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { getUserDisplayName } from "@/lib/utils";
import { getAuthenticatedUser } from "@/lib/auth/authenticate";

export async function AuthButton() {
  const user = await getAuthenticatedUser();

  return user ? (
    <div className="flex items-center gap-4">
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
