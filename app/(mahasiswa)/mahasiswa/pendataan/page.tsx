import { StatusBadge } from "@/components/uis/status-badge";

export default function MahasiswaPendataanPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="warning">Mahasiswa · Pendataan Magang</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Pendataan Magang Pasca-Diterima
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute wizard 4 langkah (Data Instansi, Program dan Periode beserta
        LOA, Pemetaan Konversi MK, dan Konfirmasi) siap dihubungkan dengan modul
        features/pendataans.
      </p>
    </section>
  );
}
