import type {
  JenisCatatanLogbook,
  StatusPendataan,
  StatusValidasiLogbook,
} from "@prisma/client";

export interface LogbookDosenRefDto {
  id: string;
  nip: string;
  namaBergelar: string;
}

export interface LogbookItemDto {
  id: string;
  pendataanId: string;
  jenisCatatan: JenisCatatanLogbook;
  tanggal: string;
  mingguKe: number;
  deskripsiKegiatan: string;
  fotoBuktiUrl: string;
  namaFileBukti: string;
  statusValidasi: StatusValidasiLogbook;
  catatanPembimbing: string | null;
  validatedAt: string | null;
  isEditable: boolean;
  validatedByDosen: LogbookDosenRefDto | null;
  mahasiswa: {
    id: string;
    nim: string;
    nama: string;
    angkatan: number;
  };
  pendataan: {
    id: string;
    namaInstansi: string;
    posisi: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    dosenPembimbingId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LogbookPendataanContextDto {
  id: string;
  namaInstansi: string;
  posisi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusPendataan: StatusPendataan;
  dosenPembimbing: LogbookDosenRefDto;
}

export interface LogbookSummaryStatsDto {
  totalEntri: number;
  tervalidasi: number;
  menungguValidasi: number;
  perluRevisi: number;
  mingguBerjalan: number;
  mingguTerisi: number;
  mingguBelumDiisi: number;
  badgePerluPerhatian: number;
}

export interface LogbooksListResponseDto {
  pendataanContext: LogbookPendataanContextDto | null;
  stats: LogbookSummaryStatsDto;
  items: LogbookItemDto[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
