import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import type { NavMenuItem } from "@/types";

const kaprodiNavItems: NavMenuItem[] = [
  { label: "Kelola Lowongan", href: "/kaprodi/lowongans" },
  { label: "Verifikasi & Penilaian", href: "/kaprodi/verifikasis" },
];

export default function KaprodiLayout({ children }: { children: ReactNode }) {
  return (
    <RoleShell roleLabel="Kaprodi" navItems={kaprodiNavItems}>
      {children}
    </RoleShell>
  );
}
