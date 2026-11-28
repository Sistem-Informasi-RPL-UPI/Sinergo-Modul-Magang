import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import { requireRoleSession } from "@/libs/auth";
import type { NavMenuItem } from "@/types";

export const dynamic = "force-dynamic";

const kaprodiNavItems: NavMenuItem[] = [
  { label: "Kelola Lowongan", href: "/kaprodi/lowongans" },
  { label: "Verifikasi & Penilaian", href: "/kaprodi/verifikasis" },
];

export default async function KaprodiLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRoleSession(["KAPRODI"], "/kaprodi/lowongans");

  return (
    <RoleShell roleLabel="Kaprodi" navItems={kaprodiNavItems}>
      {children}
    </RoleShell>
  );
}
