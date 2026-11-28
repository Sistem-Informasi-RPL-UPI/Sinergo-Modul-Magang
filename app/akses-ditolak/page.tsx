import Link from "next/link";
import { StatusBadge } from "@/components/uis/status-badge";
import { safeReturnPath } from "@/utils/safe-return";

interface AksesDitolakPageProps {
  searchParams: Promise<{ from?: string; error?: string }>;
}

export default async function AksesDitolakPage({
  searchParams,
}: AksesDitolakPageProps) {
  const params = await searchParams;
  const fallbackHref = safeReturnPath(params.from, "/");

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-12">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <StatusBadge tone="danger">403 · Akses Ditolak</StatusBadge>
        <h1 className="mt-4 font-heading text-2xl font-bold text-brand-ink">
          Peran akun tidak memiliki izin untuk halaman ini
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-muted">
          Pastikan akun SSO SACIBIRU yang digunakan memiliki peran yang sesuai
          untuk membuka ruang kerja tujuan.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={fallbackHref}
            className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#010199] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Kembali ke Halaman Utama
          </Link>
        </div>
      </section>
    </main>
  );
}
