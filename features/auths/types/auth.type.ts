import type { MasterSemesterDto } from "@/features/masters/types/master.type";
import type { RoleUserType } from "@/types";

export interface SidebarBadgesDto {
  logbookPerluRevisi: number;
  bimbinganLogbookMenunggu: number;
  pendataanMenungguVerifikasi: number;
  skMenungguPengesahan: number;
  konversiBelumDinilai: number;
}

export interface CurrentUserProfileDto {
  user: {
    id: string;
    ssoSub: string;
    email: string;
    nama: string;
    nipNim: string;
    role: RoleUserType;
    ssoRawRole: string;
  };
  mahasiswa: {
    id: string;
    nim: string;
    prodi: string;
    angkatan: number;
    statusAktif: boolean;
  } | null;
  dosen: {
    id: string;
    nip: string;
    namaBergelar: string;
    statusAktif: boolean;
  } | null;
  matakuliahsDiampu: Array<{
    id: string;
    kodeMk: string;
    namaMk: string;
    sks: number;
  }>;
  activeSemester: MasterSemesterDto | null;
  canSwitchToDosenMode: boolean;
  badges: SidebarBadgesDto;
}
