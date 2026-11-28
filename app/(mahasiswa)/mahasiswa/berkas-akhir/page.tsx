import { StatusBadge } from "@/components/uis/status-badge";

export default function MahasiswaBerkasAkhirPage() {
  return (
    <section className="rounded-2xl bg-white p-6 sm:p-8">
      <StatusBadge tone="success">Mahasiswa · Berkas Akhir</StatusBadge>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
        Pengumpulan Berkas Akhir
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-muted">
        Kerangka rute One-Stop Submission (5 dokumen wajib dan 1 sertifikat
        opsional) serta hasil konversi mata kuliah siap dihubungkan dengan modul
        features/berkas-akhirs.
      </p>
    </section>
  );
}
