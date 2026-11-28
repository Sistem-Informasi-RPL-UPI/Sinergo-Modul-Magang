import Link from "next/link";
import { StatusBadge } from "@/components/uis/status-badge";
import { SwitchSsoAccountButton } from "@/features/auths/components/switch-sso-account-button";
import { getAuthSession } from "@/libs/auth";
import { getDefaultDashboardByRole, safeReturnPath } from "@/utils/safe-return";

interface AksesDitolakPageProps {
  searchParams: Promise<{ from?: string; error?: string }>;
}

export default async function AksesDitolakPage({
  searchParams,
}: AksesDitolakPageProps) {
  const [params, session] = await Promise.all([searchParams, getAuthSession()]);
  const hasActiveModuleSession = Boolean(
    session?.user && session.error !== "RefreshAccessTokenError",
  );
  const roleDashboardHref =
    hasActiveModuleSession && session?.user
      ? getDefaultDashboardByRole(session.user.role)
      : safeReturnPath(params.from, "/mahasiswa");

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-12">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <StatusBadge tone="danger">403 · Akses Ditolak</StatusBadge>
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-ink">
          Peran akun tidak diizinkan untuk halaman ini
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          Modul Magang hanya dapat diakses sesuai hak peran masing-masing
          (Mahasiswa, Dosen, Kaprodi, atau Admin). Jika browser Anda masih
          menyimpan sesi akun lain di SSO SACIBIRU, silakan ganti akun terlebih
          dahulu.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {hasActiveModuleSession ? (
            <Link
              href={roleDashboardHref}
              className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#010199] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
            >
              Buka Ruang Kerja Peran Saya
            </Link>
          ) : null}

          <SwitchSsoAccountButton />
        </div>
      </section>
    </main>
  );
}
