import type {
  JenisProgramMbkm,
  KategoriAnalitikMbkm,
  StatusLowongan,
  SumberLowongan,
} from "@prisma/client";
import type { RoleUserType } from "@/types";

export interface LowonganDosenPjDto {
  id: string;
  nip: string;
  namaBergelar: string;
}

export interface LowonganCardDto {
  id: string;
  judulLowongan: string;
  namaInstansi: string;
  posisiBidang: string;
  lokasiModeKerja: string;
  sumberLowongan: SumberLowongan;
  kontakInstansi: string;
  logoUrl: string | null;
  statusLowongan: StatusLowongan;
  jumlahPelamar: number;
  batasTanggal: string | null;
  tanggalPublikasi: string | null;
  isExpired: boolean;
  sudahMelamar: boolean;
  tanggalMinat: string | null;
  dosenPj: LowonganDosenPjDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface LowonganDetailDto extends LowonganCardDto {
  deskripsi: string;
  persyaratan: string;
  pembuat: {
    id: string;
    nama: string;
    role: RoleUserType;
  };
}

export interface LowonganActiveSourceCountsDto {
  semua: number;
  mitraKampus: number;
  binaanDosen: number;
}

export interface LowonganAdminSummaryStatsDto {
  lowonganAktif: number;
  drafLowongan: number;
  totalPelamar: number;
  mitraTerhubung: number;
}

export interface LowongansListResponseDto {
  items: LowonganCardDto[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  sourceCounts: LowonganActiveSourceCountsDto;
  summaryStats: LowonganAdminSummaryStatsDto | null;
}

export interface CatatMinatResponseDto {
  lamaranId: string;
  lowonganId: string;
  judulLowongan: string;
  namaInstansi: string;
  kontakInstansi: string;
  jumlahPelamarTerbaru: number;
  tanggalMinat: string;
}

export interface AnalitikAngkatanItemDto {
  angkatan: number;
  magang: number;
  mbkmLainnya: number;
  total: number;
}

export interface AnalitikKomposisiProgramItemDto {
  jenisProgram: JenisProgramMbkm;
  labelProgram: string;
  kategoriAnalitik: KategoriAnalitikMbkm;
  jumlah: number;
  persen: number;
}

export interface AnalitikMbkmResponseDto {
  semester: {
    id: string;
    kodeSemester: string;
    namaSemester: string;
    jenisSemester: string;
    isAktif: boolean;
  };
  metrics: {
    mahasiswaAktif: number;
    sedangMagang: number;
    mbkmLainnya: number;
    angkatanAktif: number;
    mitraKegiatan: number;
  };
  mahasiswaPerAngkatan: AnalitikAngkatanItemDto[];
  komposisiProgram: AnalitikKomposisiProgramItemDto[];
}
