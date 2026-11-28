import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import { requireRoleSession } from "@/libs/auth";
import type { NavMenuItem } from "@/types";

export const dynamic = "force-dynamic";

const mahasiswaNavItems: NavMenuItem[] = [
  { label: "Beranda", href: "/mahasiswa" },
  { label: "Pendataan Magang", href: "/mahasiswa/pendataan" },
  { label: "Logbook Kegiatan", href: "/mahasiswa/logbooks" },
  { label: "Berkas Akhir", href: "/mahasiswa/berkas-akhir" },
];

export default async function MahasiswaLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRoleSession(["MAHASISWA"], "/mahasiswa");

  return (
    <RoleShell roleLabel="Mahasiswa" navItems={mahasiswaNavItems}>
      {children}
    </RoleShell>
  );
}
