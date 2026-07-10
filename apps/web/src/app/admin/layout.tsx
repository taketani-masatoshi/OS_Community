import Link from "next/link";
import type { SiteRole } from "@os-community/db";
import { requireRole } from "@/lib/session";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import { getPageMessages } from "@os-community/shared";
import { AdminNav } from "@/components/AdminNav";

const ADMIN_ROLES: SiteRole[] = ["ADMIN", "CERT_REVIEWER"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(ADMIN_ROLES, "/admin");
  const session = await auth();
  const role = session?.user?.siteRole ?? "MEMBER";
  const { locale } = await getT();
  const a = getPageMessages(locale).admin;

  return (
    <>
      <AdminNav
        role={role}
        labels={{
          navDashboard: a.navDashboard,
          navUsers: a.navUsers,
          navCommittees: a.navCommittees,
          navGovernance: a.navGovernance,
        }}
      />
      {children}
    </>
  );
}
