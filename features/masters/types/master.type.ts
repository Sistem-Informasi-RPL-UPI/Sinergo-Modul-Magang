export interface MasterSemesterDto {
  id: string;
  kodeSemester: string;
  namaSemester: string;
  jenisSemester: string;
  isAktif: boolean;
  tanggalMulai: string;
  tanggalSelesai: string;
}

export interface MasterSemestersResponseDto {
  activeSemesterId: string | null;
  items: MasterSemesterDto[];
}

export interface MasterDosenDto {
  id: string;
  userId: string;
  nip: string;
  namaBergelar: string;
  email: string;
  statusAktif: boolean;
  jumlahMkDiampu: number;
}

export interface MasterDosensResponseDto {
  total: number;
  items: MasterDosenDto[];
}

export interface MasterKomponenRubrikDto {
  id: string;
  namaKomponen: string;
  deskripsiKomponen: string;
  bobotPersen: number;
  urutan: number;
}

export interface MasterMataKuliahDto {
  id: string;
  kodeMk: string;
  namaMk: string;
  sks: number;
  isKonversiMbkm: boolean;
  dosenPengampu: {
    id: string;
    nip: string;
    namaBergelar: string;
  };
  komponenRubrik?: MasterKomponenRubrikDto[];
}

export interface MasterMatakuliahsResponseDto {
  total: number;
  items: MasterMataKuliahDto[];
}
