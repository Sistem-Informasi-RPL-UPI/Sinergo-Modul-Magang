import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import type { NavMenuItem } from "@/types";

const adminNavItems: NavMenuItem[] = [
  { label: "Kelola Lowongan", href: "/admin/lowongans" },
  { label: "Verifikasi & Penilaian", href: "/admin/verifikasis" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleShell roleLabel="Admin" navItems={adminNavItems}>
      {children}
    </RoleShell>
  );
}
