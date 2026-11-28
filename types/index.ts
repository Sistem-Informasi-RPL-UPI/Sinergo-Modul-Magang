export type RoleUserType = "MAHASISWA" | "DOSEN" | "ADMIN" | "KAPRODI";

export type ActiveWorkspaceMode = RoleUserType;

export type UploadCategoryType =
  | "loa-awal"
  | "logbook-bukti"
  | "berkas-akhir"
  | "logo-instansi";

export type GradeLetterType =
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "D"
  | "E";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

export interface NavMenuItem {
  label: string;
  href: string;
  badgeCount?: number;
}
