import { StatusBadge } from "@/components/uis/status-badge";

export default function KaprodiLowongansPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="brand">Kaprodi · Kelola Lowongan dan Analitik</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Aktivitas MBKM per Angkatan dan Kelola Lowongan
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute analitik sebaran kegiatan MBKM per semester serta manajemen
        daftar lowongan siap dihubungkan dengan modul features/lowongans.
      </p>
    </section>
  );
}
