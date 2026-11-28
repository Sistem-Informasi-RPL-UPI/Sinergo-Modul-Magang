import { StatusBadge } from "@/components/uis/status-badge";

export default function AdminLowongansPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="info">Admin · Kelola Lowongan</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Manajemen Publikasi Lowongan Magang
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute pengelolaan draf dan publikasi lowongan Mitra Kampus serta
        Binaan Dosen siap dihubungkan dengan modul features/lowongans.
      </p>
    </section>
  );
}
