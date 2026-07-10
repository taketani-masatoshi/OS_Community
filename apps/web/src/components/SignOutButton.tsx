import { signOut } from "@/auth";

export function SignOutButton({ label, className = "btn btn-ghost btn-sm" }: { label: string; className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
