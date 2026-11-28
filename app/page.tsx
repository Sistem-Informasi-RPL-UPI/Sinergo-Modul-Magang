import Link from "next/link";
import { StatusBadge } from "@/components/uis/status-badge";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="brand">SI RPL UPI · Modul 5</StatusBadge>
          <StatusBadge tone="success">Terintegrasi SSO SACIBIRU</StatusBadge>
        </div>

        <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
          Portal Magang dan Program MBKM
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-brand-muted">
          Platform terpusat Program Studi Rekayasa Perangkat Lunak UPI Kampus
          Cibiru untuk informasi lowongan mitra, pendataan magang pasca-diterima,
          logbook kegiatan, pengumpulan berkas akhir, penerbitan SK, dan konversi
          nilai mata kuliah.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#010199] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Masuk dengan SSO SACIBIRU
          </Link>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="font-heading text-lg font-semibold text-brand-ink">
            Rute Ruang Kerja per Peran
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Setiap rute di bawah dijaga oleh proxy RBAC sesuai sesi aktif SSO.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/mahasiswa"
              className="rounded-xl border border-slate-200 bg-brand-canvas/60 p-4 transition-colors hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <p className="font-heading text-base font-semibold text-brand-ink">
                Mahasiswa
              </p>
              <p className="mt-1 text-[13px] text-brand-muted">
                Beranda lowongan, pendataan 4 langkah, logbook, dan berkas akhir.
              </p>
            </Link>

            <Link
              href="/dosen/penilaian"
              className="rounded-xl border border-slate-200 bg-brand-canvas/60 p-4 transition-colors hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <p className="font-heading text-base font-semibold text-brand-ink">
                Dosen
              </p>
              <p className="mt-1 text-[13px] text-brand-muted">
                Validasi logbook bimbingan dan penilaian rubrik mata kuliah konversi.
              </p>
            </Link>

            <Link
              href="/kaprodi/lowongans"
              className="rounded-xl border border-slate-200 bg-brand-canvas/60 p-4 transition-colors hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <p className="font-heading text-base font-semibold text-brand-ink">
                Kaprodi
              </p>
              <p className="mt-1 text-[13px] text-brand-muted">
                Analitik MBKM per angkatan, kelola lowongan, dan pengesahan SK.
              </p>
            </Link>

            <Link
              href="/admin/lowongans"
              className="rounded-xl border border-slate-200 bg-brand-canvas/60 p-4 transition-colors hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <p className="font-heading text-base font-semibold text-brand-ink">
                Admin Prodi
              </p>
              <p className="mt-1 text-[13px] text-brand-muted">
                Publikasi lowongan, verifikasi berkas LOA, dan generasi draf SK.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
