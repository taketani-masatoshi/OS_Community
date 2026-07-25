import { cookies } from "next/headers";
import { signOut } from "@/auth";
import { REAUTH_COOKIE, REAUTH_MAX_AGE_SEC } from "@/lib/auth-reauth";

export function SignOutButton({
  label,
  className = "btn btn-ghost btn-sm",
}: {
  label: string;
  className?: string;
}) {
  return (
    <form
      action={async () => {
        "use server";
        const jar = await cookies();
        jar.set(REAUTH_COOKIE, "1", {
          path: "/",
          maxAge: REAUTH_MAX_AGE_SEC,
          sameSite: "lax",
          httpOnly: false,
        });
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
