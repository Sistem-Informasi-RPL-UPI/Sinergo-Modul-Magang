import type {
  JenisDokumenSk,
  JenisProgramMbkm,
  KategoriAnalitikMbkm,
  ModeKegiatan,
  StatusBerkasAkhir,
  StatusPendataan,
  StatusPengesahanSk,
  StatusPenilaianKonversi,
  TingkatKesesuaianMk,
} from "@prisma/client";

export interface PendataanSemesterRefDto {
  id: string;
  kodeSemester: string;
  namaSemester: string;
  jenisSemester: string;
  isAktif: boolean;
}

export interface PendataanDosenRefDto {
  id: string;
  nip: string;
  namaBergelar: string;
}

export interface PendataanKonversiMkItemDto {
  id: string;
  matakuliahId: string;
  kodeMk: string;
  namaMk: string;
  sksKonversi: number;
  tingkatKesesuaian: TingkatKesesuaianMk;
  statusPenilaian: StatusPenilaianKonversi;
  dosenPengampu: PendataanDosenRefDto;
}

export interface PendataanDokumenSkItemDto {
  id: string;
  nomorSk: string;
  jenisSk: JenisDokumenSk;
  fileSkUrl: string;
  statusPengesahan: StatusPengesahanSk;
  tanggalDibuat: string;
  tanggalDisahkan: string | null;
}

export interface PendataanBerkasAkhirRingkasDto {
  id: string;
  jumlahTerunggah: number;
  progresPersen: number;
  statusBerkas: StatusBerkasAkhir;
  submittedAt: string | null;
}

export interface PendataanDetailDto {
  id: string;
  mahasiswa: {
    id: string;
    nim: string;
    nama: string;
    email: string;
    prodi: string;
    angkatan: number;
  };
  semester: PendataanSemesterRefDto;
  namaInstansi: string;
  alamatInstansi: string;
  kontakInstansi: string;
  posisi: string;
  jenisProgram: JenisProgramMbkm;
  kategoriAnalitik: KategoriAnalitikMbkm;
  modeKegiatan: ModeKegiatan;
  tanggalMulai: string;
  tanggalSelesai: string;
  fileLoaAwalUrl: string;
  fileLoaAwalNama: string;
  pernyataanBenar: boolean;
  statusPendataan: StatusPendataan;
  catatanRevisi: string | null;
  isEditable: boolean;
  dosenPembimbing: PendataanDosenRefDto;
  dosenKunjung: PendataanDosenRefDto | null;
  verifiedBy: {
    id: string;
    nama: string;
  } | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  totalMkKonversi: number;
  totalSksKonversi: number;
  konversiMks: PendataanKonversiMkItemDto[];
  dokumenSks: PendataanDokumenSkItemDto[];
  berkasAkhir: PendataanBerkasAkhirRingkasDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface MahasiswaPendataanOwnResponseDto {
  semester: PendataanSemesterRefDto | null;
  pendataan: PendataanDetailDto | null;
}

export interface RekapVerifikasiStatsDto {
  menungguVerifikasi: number;
  pendataanAktif: number;
  skBelumDisahkan: number;
  kelengkapanBerkasPersen: number;
}

export interface RekapPendataanRowDto {
  id: string;
  mahasiswa: {
    id: string;
    nim: string;
    nama: string;
    angkatan: number;
  };
  namaInstansi: string;
  posisi: string;
  jenisProgram: JenisProgramMbkm;
  kategoriAnalitik: KategoriAnalitikMbkm;
  modeKegiatan: ModeKegiatan;
  tanggalMulai: string;
  tanggalSelesai: string;
  fileLoaAwalUrl: string;
  fileLoaAwalNama: string;
  statusPendataan: StatusPendataan;
  catatanRevisi: string | null;
  dosenPembimbing: PendataanDosenRefDto;
  dosenKunjung: PendataanDosenRefDto | null;
  totalMkKonversi: number;
  totalSksKonversi: number;
  progresBerkasPersen: number;
  dokumenSks: PendataanDokumenSkItemDto[];
  submittedAt: string | null;
  verifiedAt: string | null;
}

export interface RekapPendataansListResponseDto {
  semester: PendataanSemesterRefDto;
  stats: RekapVerifikasiStatsDto;
  items: RekapPendataanRowDto[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
