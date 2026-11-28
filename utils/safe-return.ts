// Hanya izinkan path internal berawalan "/" tunggal untuk mencegah Open Redirect pada alur return_to SSO.
export function safeReturnPath(
  candidate: string | null | undefined,
  fallback = "/",
): string {
  if (!candidate || !candidate.startsWith("/")) {
    return fallback;
  }
  if (candidate.startsWith("//") || candidate.includes("\\")) {
    return fallback;
  }
  return candidate;
}

export function getDefaultDashboardByRole(
  role: "MAHASISWA" | "DOSEN" | "ADMIN" | "KAPRODI",
): string {
  switch (role) {
    case "MAHASISWA":
      return "/mahasiswa";
    case "DOSEN":
      return "/dosen/penilaian";
    case "KAPRODI":
      return "/kaprodi/lowongans";
    case "ADMIN":
      return "/admin/lowongans";
  }
}
