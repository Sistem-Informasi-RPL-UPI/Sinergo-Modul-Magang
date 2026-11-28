import type { ReactNode } from "react";
import { RoleShell } from "@/components/layouts/role-shell";
import type { NavMenuItem } from "@/types";

const mahasiswaNavItems: NavMenuItem[] = [
  { label: "Beranda", href: "/mahasiswa" },
  { label: "Pendataan Magang", href: "/mahasiswa/pendataan" },
  { label: "Logbook Kegiatan", href: "/mahasiswa/logbooks" },
  { label: "Berkas Akhir", href: "/mahasiswa/berkas-akhir" },
];

export default function MahasiswaLayout({ children }: { children: ReactNode }) {
  return (
    <RoleShell roleLabel="Mahasiswa" navItems={mahasiswaNavItems}>
      {children}
    </RoleShell>
  );
}
