import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import { requireRoleSession } from "@/libs/auth";
import type { NavMenuItem } from "@/types";

export const dynamic = "force-dynamic";

const dosenNavItems: NavMenuItem[] = [
  { label: "Penilaian & SK", href: "/dosen/penilaian" },
];

export default async function DosenLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRoleSession(["DOSEN"], "/dosen/penilaian");

  return (
    <RoleShell roleLabel="Dosen" navItems={dosenNavItems}>
      {children}
    </RoleShell>
  );
}
