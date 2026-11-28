import { StatusBadge } from "@/components/uis/status-badge";

export default function MahasiswaBerandaPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="info">Mahasiswa · Beranda</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Beranda Lowongan Magang
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute beranda mahasiswa siap diintegrasikan dengan komponen
        pencarian, filter Mitra Kampus dan Binaan Dosen, serta kartu lowongan dari
        modul features/lowongans.
      </p>
    </section>
  );
}
