import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import { requireRoleSession } from "@/libs/auth";
import type { NavMenuItem } from "@/types";

export const dynamic = "force-dynamic";

const adminNavItems: NavMenuItem[] = [
  { label: "Kelola Lowongan", href: "/admin/lowongans" },
  { label: "Verifikasi & Penilaian", href: "/admin/verifikasis" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRoleSession(["ADMIN"], "/admin/lowongans");

  return (
    <RoleShell roleLabel="Admin" navItems={adminNavItems}>
      {children}
    </RoleShell>
  );
}
