import { StatusBadge } from "@/components/uis/status-badge";

export default function DosenPenilaianPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="brand">Dosen · Verifikasi dan Penilaian</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Penilaian Konversi Mata Kuliah dan Validasi Bimbingan
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute evaluasi rubrik capaian mata kuliah pengampu dan pemeriksaan
        bukti pendukung mahasiswa siap dihubungkan dengan modul
        features/penilaians.
      </p>
    </section>
  );
}
