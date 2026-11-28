import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import type { NavMenuItem } from "@/types";

const dosenNavItems: NavMenuItem[] = [
  { label: "Penilaian & SK", href: "/dosen/penilaian" },
];

export default function DosenLayout({ children }: { children: ReactNode }) {
  return (
    <RoleShell roleLabel="Dosen" navItems={dosenNavItems}>
      {children}
    </RoleShell>
  );
}
