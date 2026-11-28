import {
  JenisProgramMbkm,
  KategoriAnalitikMbkm,
  type Prisma,
  StatusLowongan,
  StatusPendataan,
  SumberLowongan,
} from "@prisma/client";
import type {
  AnalitikMbkmQueryInput,
  ParsedCreateLowongan,
  ParsedLowongansQuery,
  ParsedUpdateLowongan,
} from "@/features/lowongans/schemas/lowongan.schema";
import type {
  AnalitikMbkmResponseDto,
  CatatMinatResponseDto,
  LowonganAdminSummaryStatsDto,
  LowonganCardDto,
  LowonganDetailDto,
  LowongansListResponseDto,
} from "@/features/lowongans/types/lowongan.type";
import type { ApiAuthContext } from "@/libs/api-auth";
import { prisma } from "@/libs/prisma";
import { ApiHttpError } from "@/utils/api-error";
import { resolveKategoriAnalitikMbkm } from "@/utils/grade-converter";

const PROGRAM_MBKM_ORDER: ReadonlyArray<{
  jenisProgram: JenisProgramMbkm;
  labelProgram: string;
}> = [
  { jenisProgram: JenisProgramMbkm.MSIB, labelProgram: "Magang Bersertifikat (MSIB)" },
  { jenisProgram: JenisProgramMbkm.MM, labelProgram: "Magang Mandiri" },
  { jenisProgram: JenisProgramMbkm.SI, labelProgram: "Studi Independen" },
  { jenisProgram: JenisProgramMbkm.PMM, labelProgram: "Pertukaran Mahasiswa Merdeka" },
  { jenisProgram: JenisProgramMbkm.KM, labelProgram: "Kampus Mengajar" },
  { jenisProgram: JenisProgramMbkm.IISMA, labelProgram: "IISMA" },
  { jenisProgram: JenisProgramMbkm.WMK, labelProgram: "Wirausaha Merdeka" },
  { jenisProgram: JenisProgramMbkm.PM, labelProgram: "Proyek Kemanusiaan" },
  { jenisProgram: JenisProgramMbkm.RISET, labelProgram: "Riset / Penelitian MBKM" },
];

// Bandingkan batas tanggal menggunakan akhir hari zona waktu WIB (UTC+7) agar tanggal jatuh tempo tetap berlaku penuh sepanjang hari tersebut.
function isDeadlinePassedWib(batasTanggal: Date | null): boolean {
  if (!batasTanggal) {
    return false;
  }
  const yyyyMmDd = batasTanggal.toISOString().slice(0, 10);
  const endOfDayWib = new Date(`${yyyyMmDd}T23:59:59.999+07:00`);
  return Date.now() > endOfDayWib.getTime();
}

async function assertActiveDosenIfProvided(
  dosenPjId: string | null | undefined,
): Promise<void> {
  if (!dosenPjId) {
    return;
  }

  const dosen = await prisma.dosen.findUnique({
    where: { id: dosenPjId },
    select: { id: true, statusAktif: true },
  });

  if (!dosen || !dosen.statusAktif) {
    throw new ApiHttpError(
      400,
      "Dosen Penanggung Jawab tidak ditemukan atau berstatus tidak aktif.",
    );
  }
}

function mapLowonganCardDto(row: {
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
  batasTanggal: Date | null;
  tanggalPublikasi: Date | null;
  createdAt: Date;
  updatedAt: Date;
  dosenPj: {
    id: string;
    nip: string;
    namaBergelar: string;
  } | null;
  lamarans?: Array<{ tanggalMinat: Date }>;
}): LowonganCardDto {
  const myLamaran = row.lamarans?.[0] ?? null;

  return {
    id: row.id,
    judulLowongan: row.judulLowongan,
    namaInstansi: row.namaInstansi,
    posisiBidang: row.posisiBidang,
    lokasiModeKerja: row.lokasiModeKerja,
    sumberLowongan: row.sumberLowongan,
    kontakInstansi: row.kontakInstansi,
    logoUrl: row.logoUrl,
    statusLowongan: row.statusLowongan,
    jumlahPelamar: row.jumlahPelamar,
    batasTanggal: row.batasTanggal ? row.batasTanggal.toISOString().slice(0, 10) : null,
    tanggalPublikasi: row.tanggalPublikasi ? row.tanggalPublikasi.toISOString() : null,
    isExpired: isDeadlinePassedWib(row.batasTanggal),
    sudahMelamar: Boolean(myLamaran),
    tanggalMinat: myLamaran ? myLamaran.tanggalMinat.toISOString() : null,
    dosenPj: row.dosenPj
      ? {
          id: row.dosenPj.id,
          nip: row.dosenPj.nip,
          namaBergelar: row.dosenPj.namaBergelar,
        }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listLowongans(
  context: ApiAuthContext,
  query: ParsedLowongansQuery,
): Promise<LowongansListResponseDto> {
  const isManager =
    context.user.role === "ADMIN" || context.user.role === "KAPRODI";
  const effectiveStatus = isManager ? query.status : StatusLowongan.AKTIF;

  const where: Prisma.LowonganMagangWhereInput = {
    ...(effectiveStatus ? { statusLowongan: effectiveStatus } : {}),
    ...(query.sumber ? { sumberLowongan: query.sumber } : {}),
    ...(query.q
      ? {
          OR: [
            { judulLowongan: { contains: query.q } },
            { namaInstansi: { contains: query.q } },
            { posisiBidang: { contains: query.q } },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [rows, totalItems, activeGroupedCounts, managerRows] = await Promise.all([
    prisma.lowonganMagang.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        dosenPj: {
          select: {
            id: true,
            nip: true,
            namaBergelar: true,
          },
        },
        lamarans: context.mahasiswa
          ? {
              where: { mahasiswaId: context.mahasiswa.id },
              select: { tanggalMinat: true },
              take: 1,
            }
          : false,
      },
      orderBy: [{ tanggalPublikasi: "desc" }, { createdAt: "desc" }],
    }),
    prisma.lowonganMagang.count({ where }),
    prisma.lowonganMagang.groupBy({
      by: ["sumberLowongan"],
      where: { statusLowongan: StatusLowongan.AKTIF },
      _count: { id: true },
    }),
    isManager
      ? prisma.lowonganMagang.findMany({
          select: {
            statusLowongan: true,
            jumlahPelamar: true,
            namaInstansi: true,
          },
        })
      : Promise.resolve(null),
  ]);

  let mitraKampusCount = 0;
  let binaanDosenCount = 0;
  for (const group of activeGroupedCounts) {
    if (group.sumberLowongan === SumberLowongan.MITRA_KAMPUS) {
      mitraKampusCount = group._count.id;
    } else if (group.sumberLowongan === SumberLowongan.BINAAN_DOSEN) {
      binaanDosenCount = group._count.id;
    }
  }

  let summaryStats: LowonganAdminSummaryStatsDto | null = null;
  if (managerRows) {
    let lowonganAktif = 0;
    let drafLowongan = 0;
    let totalPelamar = 0;
    const uniqueMitra = new Set<string>();

    for (const item of managerRows) {
      if (item.statusLowongan === StatusLowongan.AKTIF) {
        lowonganAktif += 1;
      } else if (item.statusLowongan === StatusLowongan.DRAF) {
        drafLowongan += 1;
      }
      totalPelamar += item.jumlahPelamar;
      const normalizedInstansi = item.namaInstansi.trim().toLowerCase();
      if (normalizedInstansi) {
        uniqueMitra.add(normalizedInstansi);
      }
    }

    summaryStats = {
      lowonganAktif,
      drafLowongan,
      totalPelamar,
      mitraTerhubung: uniqueMitra.size,
    };
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / query.limit));

  return {
    items: rows.map(mapLowonganCardDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
    },
    sourceCounts: {
      semua: mitraKampusCount + binaanDosenCount,
      mitraKampus: mitraKampusCount,
      binaanDosen: binaanDosenCount,
    },
    summaryStats,
  };
}

export async function getLowonganDetail(
  context: ApiAuthContext,
  lowonganId: string,
): Promise<LowonganDetailDto> {
  const isManager =
    context.user.role === "ADMIN" || context.user.role === "KAPRODI";

  const row = await prisma.lowonganMagang.findUnique({
    where: { id: lowonganId },
    include: {
      dosenPj: {
        select: {
          id: true,
          nip: true,
          namaBergelar: true,
        },
      },
      pembuatUser: {
        select: {
          id: true,
          nama: true,
          role: true,
        },
      },
      lamarans: context.mahasiswa
        ? {
            where: { mahasiswaId: context.mahasiswa.id },
            select: { tanggalMinat: true },
            take: 1,
          }
        : false,
    },
  });

  if (!row || (!isManager && row.statusLowongan !== StatusLowongan.AKTIF)) {
    throw new ApiHttpError(404, "Lowongan magang tidak ditemukan.");
  }

  return {
    ...mapLowonganCardDto(row),
    deskripsi: row.deskripsi,
    persyaratan: row.persyaratan,
    pembuat: {
      id: row.pembuatUser.id,
      nama: row.pembuatUser.nama,
      role: row.pembuatUser.role,
    },
  };
}

export async function createLowonganRecord(
  context: ApiAuthContext,
  input: ParsedCreateLowongan,
): Promise<LowonganDetailDto> {
  await assertActiveDosenIfProvided(input.dosenPjId);

  const created = await prisma.lowonganMagang.create({
    data: {
      pembuatUserId: context.user.id,
      dosenPjId: input.dosenPjId ?? null,
      judulLowongan: input.judulLowongan,
      namaInstansi: input.namaInstansi,
      posisiBidang: input.posisiBidang,
      lokasiModeKerja: input.lokasiModeKerja,
      sumberLowongan: input.sumberLowongan,
      kontakInstansi: input.kontakInstansi,
      deskripsi: input.deskripsi,
      persyaratan: input.persyaratan,
      logoUrl: input.logoUrl ?? null,
      batasTanggal: input.batasTanggal ?? null,
      statusLowongan: input.statusLowongan,
      tanggalPublikasi:
        input.statusLowongan === StatusLowongan.AKTIF ? new Date() : null,
    },
  });

  return getLowonganDetail(context, created.id);
}

export async function updateLowonganRecord(
  context: ApiAuthContext,
  lowonganId: string,
  input: ParsedUpdateLowongan,
): Promise<LowonganDetailDto> {
  const existing = await prisma.lowonganMagang.findUnique({
    where: { id: lowonganId },
  });

  if (!existing) {
    throw new ApiHttpError(404, "Lowongan magang tidak ditemukan.");
  }

  const nextSumber = input.sumberLowongan ?? existing.sumberLowongan;
  const nextDosenPjId =
    input.dosenPjId !== undefined
      ? input.dosenPjId
      : nextSumber === SumberLowongan.MITRA_KAMPUS &&
          existing.sumberLowongan === SumberLowongan.BINAAN_DOSEN
        ? null
        : existing.dosenPjId;

  if (nextSumber === SumberLowongan.BINAAN_DOSEN && !nextDosenPjId) {
    throw new ApiHttpError(
      400,
      "Dosen Penanggung Jawab wajib dipilih untuk lowongan Binaan Dosen.",
      {
        dosenPjId: [
          "Dosen Penanggung Jawab wajib dipilih untuk lowongan Binaan Dosen.",
        ],
      },
    );
  }

  await assertActiveDosenIfProvided(nextDosenPjId);

  const nextStatus = input.statusLowongan ?? existing.statusLowongan;
  const shouldSetPublishTimestamp =
    nextStatus === StatusLowongan.AKTIF && !existing.tanggalPublikasi;

  await prisma.lowonganMagang.update({
    where: { id: lowonganId },
    data: {
      ...(input.judulLowongan !== undefined
        ? { judulLowongan: input.judulLowongan }
        : {}),
      ...(input.namaInstansi !== undefined
        ? { namaInstansi: input.namaInstansi }
        : {}),
      ...(input.posisiBidang !== undefined
        ? { posisiBidang: input.posisiBidang }
        : {}),
      ...(input.lokasiModeKerja !== undefined
        ? { lokasiModeKerja: input.lokasiModeKerja }
        : {}),
      sumberLowongan: nextSumber,
      dosenPjId: nextDosenPjId,
      ...(input.kontakInstansi !== undefined
        ? { kontakInstansi: input.kontakInstansi }
        : {}),
      ...(input.deskripsi !== undefined ? { deskripsi: input.deskripsi } : {}),
      ...(input.persyaratan !== undefined
        ? { persyaratan: input.persyaratan }
        : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
      ...(input.batasTanggal !== undefined
        ? { batasTanggal: input.batasTanggal }
        : {}),
      statusLowongan: nextStatus,
      ...(shouldSetPublishTimestamp ? { tanggalPublikasi: new Date() } : {}),
    },
  });

  return getLowonganDetail(context, lowonganId);
}

export async function deleteLowonganRecord(lowonganId: string): Promise<void> {
  const existing = await prisma.lowonganMagang.findUnique({
    where: { id: lowonganId },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiHttpError(404, "Lowongan magang tidak ditemukan.");
  }

  await prisma.lowonganMagang.delete({
    where: { id: lowonganId },
  });
}

export async function recordMinatLowongan(
  context: ApiAuthContext,
  lowonganId: string,
): Promise<CatatMinatResponseDto> {
  if (!context.mahasiswa) {
    throw new ApiHttpError(
      403,
      "Hanya akun Mahasiswa yang dapat mencatat minat pada lowongan magang.",
    );
  }

  if (!context.mahasiswa.statusAktif) {
    throw new ApiHttpError(
      403,
      "Status akademik mahasiswa tidak aktif sehingga tidak dapat melamar lowongan.",
    );
  }

  const mahasiswaId = context.mahasiswa.id;

  return prisma.$transaction(async (tx) => {
    const lowongan = await tx.lowonganMagang.findUnique({
      where: { id: lowonganId },
    });

    if (!lowongan || lowongan.statusLowongan !== StatusLowongan.AKTIF) {
      throw new ApiHttpError(
        404,
        "Lowongan magang tidak ditemukan atau sudah tidak menerima pendaftaran.",
      );
    }

    if (isDeadlinePassedWib(lowongan.batasTanggal)) {
      throw new ApiHttpError(
        400,
        "Batas waktu pendaftaran untuk lowongan ini telah berakhir.",
      );
    }

    const existingLamaran = await tx.lamaranLowongan.findUnique({
      where: {
        lowonganId_mahasiswaId: {
          lowonganId,
          mahasiswaId,
        },
      },
    });

    if (existingLamaran) {
      throw new ApiHttpError(
        409,
        "Minat Anda pada lowongan ini sudah tercatat sebelumnya.",
      );
    }

    const lamaran = await tx.lamaranLowongan.create({
      data: {
        lowonganId,
        mahasiswaId,
      },
    });

    const updatedLowongan = await tx.lowonganMagang.update({
      where: { id: lowonganId },
      data: {
        jumlahPelamar: { increment: 1 },
      },
    });

    return {
      lamaranId: lamaran.id,
      lowonganId: updatedLowongan.id,
      judulLowongan: updatedLowongan.judulLowongan,
      namaInstansi: updatedLowongan.namaInstansi,
      kontakInstansi: updatedLowongan.kontakInstansi,
      jumlahPelamarTerbaru: updatedLowongan.jumlahPelamar,
      tanggalMinat: lamaran.tanggalMinat.toISOString(),
    };
  });
}

export async function getAnalitikMbkmKaprodi(
  query: AnalitikMbkmQueryInput,
): Promise<AnalitikMbkmResponseDto> {
  const semester = query.semesterId
    ? await prisma.periodeSemester.findUnique({
        where: { id: query.semesterId },
      })
    : await prisma.periodeSemester.findFirst({
        where: { isAktif: true },
        orderBy: { kodeSemester: "desc" },
      });

  if (!semester) {
    throw new ApiHttpError(
      404,
      "Periode semester yang diminta tidak ditemukan.",
    );
  }

  const verifiedRows = await prisma.pendataanMagang.findMany({
    where: {
      semesterId: semester.id,
      statusPendataan: StatusPendataan.TERVERIFIKASI,
    },
    select: {
      namaInstansi: true,
      jenisProgram: true,
      kategoriAnalitik: true,
      mahasiswa: {
        select: {
          angkatan: true,
        },
      },
    },
  });

  const mahasiswaAktif = verifiedRows.length;
  let sedangMagang = 0;
  let mbkmLainnya = 0;

  const uniqueMitra = new Set<string>();
  const angkatanMap = new Map<
    number,
    { magang: number; mbkmLainnya: number }
  >();
  const programCounts = new Map<JenisProgramMbkm, number>();

  for (const row of verifiedRows) {
    if (row.kategoriAnalitik === KategoriAnalitikMbkm.MAGANG) {
      sedangMagang += 1;
    } else {
      mbkmLainnya += 1;
    }

    const normalizedInstansi = row.namaInstansi.trim().toLowerCase();
    if (normalizedInstansi) {
      uniqueMitra.add(normalizedInstansi);
    }

    const angkatan = row.mahasiswa.angkatan;
    const bucket = angkatanMap.get(angkatan) ?? { magang: 0, mbkmLainnya: 0 };
    if (row.kategoriAnalitik === KategoriAnalitikMbkm.MAGANG) {
      bucket.magang += 1;
    } else {
      bucket.mbkmLainnya += 1;
    }
    angkatanMap.set(angkatan, bucket);

    programCounts.set(
      row.jenisProgram,
      (programCounts.get(row.jenisProgram) ?? 0) + 1,
    );
  }

  const mahasiswaPerAngkatan = Array.from(angkatanMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([angkatan, counts]) => ({
      angkatan,
      magang: counts.magang,
      mbkmLainnya: counts.mbkmLainnya,
      total: counts.magang + counts.mbkmLainnya,
    }));

  const komposisiProgram = PROGRAM_MBKM_ORDER.map((meta) => {
    const jumlah = programCounts.get(meta.jenisProgram) ?? 0;
    const persen =
      mahasiswaAktif > 0
        ? Math.round(((jumlah / mahasiswaAktif) * 100 + Number.EPSILON) * 100) /
          100
        : 0;

    return {
      jenisProgram: meta.jenisProgram,
      labelProgram: meta.labelProgram,
      kategoriAnalitik: resolveKategoriAnalitikMbkm(meta.jenisProgram),
      jumlah,
      persen,
    };
  });

  return {
    semester: {
      id: semester.id,
      kodeSemester: semester.kodeSemester,
      namaSemester: semester.namaSemester,
      jenisSemester: semester.jenisSemester,
      isAktif: semester.isAktif,
    },
    metrics: {
      mahasiswaAktif,
      sedangMagang,
      mbkmLainnya,
      angkatanAktif: angkatanMap.size,
      mitraKegiatan: uniqueMitra.size,
    },
    mahasiswaPerAngkatan,
    komposisiProgram,
  };
}
