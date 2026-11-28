import { StatusBadge } from "@/components/uis/status-badge";

export default function MahasiswaLogbooksPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="info">Mahasiswa · Logbook Kegiatan</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Logbook Kegiatan Digital
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute pencatatan aktivitas mingguan dan rekap bulanan beserta
        riwayat validasi dosen siap dihubungkan dengan modul features/logbooks.
      </p>
    </section>
  );
}
