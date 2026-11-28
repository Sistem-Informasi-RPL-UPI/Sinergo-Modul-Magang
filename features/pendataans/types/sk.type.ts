import type {
  JenisDokumenSk,
  JenisProgramMbkm,
  StatusPengesahanSk,
} from "@prisma/client";
import type {
  PendataanDosenRefDto,
  PendataanSemesterRefDto,
} from "@/features/pendataans/types/pendataan.type";

export interface DokumenSkDetailDto {
  id: string;
  pendataanId: string;
  nomorSk: string;
  jenisSk: JenisDokumenSk;
  fileSkUrl: string;
  statusPengesahan: StatusPengesahanSk;
  tanggalDibuat: string;
  tanggalDisahkan: string | null;
  generatedBy: {
    id: string;
    nama: string;
  };
  disahkanKaprodi: PendataanDosenRefDto | null;
  pendataan: {
    id: string;
    namaInstansi: string;
    posisi: string;
    jenisProgram: JenisProgramMbkm;
    tanggalMulai: string;
    tanggalSelesai: string;
    mahasiswa: {
      id: string;
      nim: string;
      nama: string;
      angkatan: number;
    };
    semester: PendataanSemesterRefDto;
    dosenPembimbing: PendataanDosenRefDto;
    dosenKunjung: PendataanDosenRefDto | null;
    totalSksKonversi: number;
  };
}

export interface GenerateSkResponseDto {
  pendataanId: string;
  generatedCount: number;
  items: DokumenSkDetailDto[];
}

export interface DokumenSksListResponseDto {
  items: DokumenSkDetailDto[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
