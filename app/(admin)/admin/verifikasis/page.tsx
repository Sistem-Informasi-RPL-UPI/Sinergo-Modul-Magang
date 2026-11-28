import { StatusBadge } from "@/components/uis/status-badge";

export default function AdminVerifikasisPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="warning">Admin · Verifikasi dan Generasi SK</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Verifikasi Pendataan Mahasiswa dan Otomatisasi Draf SK
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute pemeriksaan berkas LOA awal, plotting pembimbing lapangan,
        dan generasi draf SK siap dihubungkan dengan modul features/pendataans.
      </p>
    </section>
  );
}
