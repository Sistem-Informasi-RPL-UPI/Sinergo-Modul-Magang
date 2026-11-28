export type RoleUserType = "MAHASISWA" | "DOSEN" | "ADMIN" | "KAPRODI";

export type ActiveWorkspaceMode = RoleUserType;

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
