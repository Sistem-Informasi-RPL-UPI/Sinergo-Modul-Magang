import { StatusBadge } from "@/components/uis/status-badge";

export default function KaprodiVerifikasisPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="success">Kaprodi · Verifikasi dan Pengesahan SK</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Rekap Pendataan, Plotting Dosen Kunjung, dan Pengesahan SK
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute peninjauan pendataan mahasiswa, penetapan pembimbing
        lapangan, dan pengesahan resmi Surat Keputusan siap dihubungkan dengan
        modul features/pendataans.
      </p>
    </section>
  );
}
