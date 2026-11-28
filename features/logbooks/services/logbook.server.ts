import {
  type Prisma,
  StatusPendataan,
  StatusValidasiLogbook,
} from "@prisma/client";
import type {
  ParsedCreateLogbook,
  ParsedLogbooksQuery,
  ParsedUpdateLogbook,
  ValidasiLogbookDecisionInput,
} from "@/features/logbooks/schemas/logbook.schema";
import type {
  LogbookItemDto,
  LogbookPendataanContextDto,
  LogbooksListResponseDto,
  LogbookSummaryStatsDto,
} from "@/features/logbooks/types/logbook.type";
import type { ApiAuthContext } from "@/libs/api-auth";
import { prisma } from "@/libs/prisma";
import { ApiHttpError } from "@/utils/api-error";

const logbookDetailInclude = {
  validatedByDosen: {
    select: {
      id: true,
      nip: true,
      namaBergelar: true,
    },
  },
  pendataan: {
    include: {
      mahasiswa: {
        include: {
          user: {
            select: { nama: true },
          },
        },
      },
    },
  },
} satisfies Prisma.LogbookInclude;

type LogbookWithRelations = Prisma.LogbookGetPayload<{
  include: typeof logbookDetailInclude;
}>;

function toYyyyMmDd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getTodayWibYyyyMmDd(): string {
  const shiftedWib = new Date(Date.now() + 7 * 3600_000);
  return shiftedWib.toISOString().slice(0, 10);
}

function assertDateWithinPeriod(
  tanggal: Date,
  tanggalMulai: Date,
  tanggalSelesai: Date,
): void {
  const targetStr = toYyyyMmDd(tanggal);
  const startStr = toYyyyMmDd(tanggalMulai);
  const endStr = toYyyyMmDd(tanggalSelesai);

  if (targetStr < startStr || targetStr > endStr) {
    throw new ApiHttpError(
      400,
      `Tanggal kegiatan (${targetStr}) harus berada dalam rentang periode magang (${startStr} s.d. ${endStr}).`,
      {
        tanggal: [
          `Tanggal wajib berada di antara ${startStr} hingga ${endStr}.`,
        ],
      },
    );
  }
}

function mapLogbookItemDto(row: LogbookWithRelations): LogbookItemDto {
  return {
    id: row.id,
    pendataanId: row.pendataanId,
    jenisCatatan: row.jenisCatatan,
    tanggal: toYyyyMmDd(row.tanggal),
    mingguKe: row.mingguKe,
    deskripsiKegiatan: row.deskripsiKegiatan,
    fotoBuktiUrl: row.fotoBuktiUrl,
    namaFileBukti: row.namaFileBukti,
    statusValidasi: row.statusValidasi,
    catatanPembimbing: row.catatanPembimbing,
    validatedAt: row.validatedAt ? row.validatedAt.toISOString() : null,
    isEditable: row.statusValidasi !== StatusValidasiLogbook.TERVALIDASI,
    validatedByDosen: row.validatedByDosen,
    mahasiswa: {
      id: row.pendataan.mahasiswa.id,
      nim: row.pendataan.mahasiswa.nim,
      nama: row.pendataan.mahasiswa.user.nama,
      angkatan: row.pendataan.mahasiswa.angkatan,
    },
    pendataan: {
      id: row.pendataan.id,
      namaInstansi: row.pendataan.namaInstansi,
      posisi: row.pendataan.posisi,
      tanggalMulai: toYyyyMmDd(row.pendataan.tanggalMulai),
      tanggalSelesai: toYyyyMmDd(row.pendataan.tanggalSelesai),
      dosenPembimbingId: row.pendataan.dosenPembimbingId,
    },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function computeLogbookSummaryStats(
  entries: ReadonlyArray<{
    mingguKe: number;
    statusValidasi: StatusValidasiLogbook;
  }>,
  period: { tanggalMulai: Date; tanggalSelesai: Date } | null,
): LogbookSummaryStatsDto {
  let tervalidasi = 0;
  let menungguValidasi = 0;
  let perluRevisi = 0;

  for (const item of entries) {
    if (item.statusValidasi === StatusValidasiLogbook.TERVALIDASI) {
      tervalidasi += 1;
    } else if (item.statusValidasi === StatusValidasiLogbook.MENUNGGU_VALIDASI) {
      menungguValidasi += 1;
    } else if (item.statusValidasi === StatusValidasiLogbook.PERLU_REVISI) {
      perluRevisi += 1;
    }
  }

  let mingguBerjalan = 0;
  let mingguTerisi = 0;

  if (period) {
    const startStr = toYyyyMmDd(period.tanggalMulai);
    const endStr = toYyyyMmDd(period.tanggalSelesai);
    const todayStr = getTodayWibYyyyMmDd();

    if (todayStr >= startStr) {
      const effectiveEndStr = todayStr < endStr ? todayStr : endStr;
      const diffMs =
        Date.parse(`${effectiveEndStr}T00:00:00.000Z`) -
        Date.parse(`${startStr}T00:00:00.000Z`);
      const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000));
      mingguBerjalan = Math.min(30, Math.floor(diffDays / 7) + 1);
    }

    const filledWeeks = new Set<number>();
    for (const item of entries) {
      if (item.mingguKe >= 1 && item.mingguKe <= mingguBerjalan) {
        filledWeeks.add(item.mingguKe);
      }
    }
    mingguTerisi = filledWeeks.size;
  }

  const mingguBelumDiisi = Math.max(0, mingguBerjalan - mingguTerisi);

  return {
    totalEntri: entries.length,
    tervalidasi,
    menungguValidasi,
    perluRevisi,
    mingguBerjalan,
    mingguTerisi,
    mingguBelumDiisi,
    badgePerluPerhatian: perluRevisi + mingguBelumDiisi,
  };
}

function buildDosenReadablePendataanWhere(
  dosenId: string,
): Prisma.PendataanMagangWhereInput {
  return {
    OR: [
      { dosenPembimbingId: dosenId },
      { dosenKunjungId: dosenId },
      {
        konversiMks: {
          some: {
            matakuliah: {
              dosenPengampuId: dosenId,
            },
          },
        },
      },
    ],
  };
}

async function assertCanReadLogbookRow(
  context: ApiAuthContext,
  row: LogbookWithRelations,
): Promise<void> {
  if (context.user.role === "ADMIN" || context.user.role === "KAPRODI") {
    return;
  }

  if (context.user.role === "MAHASISWA") {
    if (
      !context.mahasiswa ||
      row.pendataan.mahasiswaId !== context.mahasiswa.id
    ) {
      throw new ApiHttpError(
        403,
        "Anda tidak berwenang melihat catatan logbook mahasiswa lain.",
      );
    }
    return;
  }

  if (context.user.role === "DOSEN" && context.dosen) {
    const isPembimbingOrKunjung =
      row.pendataan.dosenPembimbingId === context.dosen.id ||
      row.pendataan.dosenKunjungId === context.dosen.id;

    if (isPembimbingOrKunjung) {
      return;
    }

    const teachesConversionCourse = await prisma.konversiMataKuliah.count({
      where: {
        pendataanId: row.pendataanId,
        matakuliah: {
          dosenPengampuId: context.dosen.id,
        },
      },
    });

    if (teachesConversionCourse > 0) {
      return;
    }
  }

  throw new ApiHttpError(
    403,
    "Anda tidak memiliki akses baca pada catatan logbook ini.",
  );
}

export async function listLogbooks(
  context: ApiAuthContext,
  query: ParsedLogbooksQuery,
): Promise<LogbooksListResponseDto> {
  let targetSemesterId = query.semesterId;
  if (!targetSemesterId) {
    const activeSem = await prisma.periodeSemester.findFirst({
      where: { isAktif: true },
      orderBy: { kodeSemester: "desc" },
      select: { id: true },
    });
    targetSemesterId = activeSem?.id;
  }

  let pendataanContext: LogbookPendataanContextDto | null = null;
  let periodForStats: { tanggalMulai: Date; tanggalSelesai: Date } | null = null;

  if (context.user.role === "MAHASISWA") {
    if (!context.mahasiswa) {
      throw new ApiHttpError(403, "Profil mahasiswa tidak ditemukan.");
    }

    const ownPendataan = await prisma.pendataanMagang.findFirst({
      where: {
        mahasiswaId: context.mahasiswa.id,
        ...(query.pendataanId ? { id: query.pendataanId } : {}),
        ...(targetSemesterId ? { semesterId: targetSemesterId } : {}),
      },
      include: {
        dosenPembimbing: {
          select: {
            id: true,
            nip: true,
            namaBergelar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!ownPendataan) {
      return {
        pendataanContext: null,
        stats: computeLogbookSummaryStats([], null),
        items: [],
        pagination: {
          page: query.page,
          limit: query.limit,
          totalItems: 0,
          totalPages: 1,
        },
      };
    }

    pendataanContext = {
      id: ownPendataan.id,
      namaInstansi: ownPendataan.namaInstansi,
      posisi: ownPendataan.posisi,
      tanggalMulai: toYyyyMmDd(ownPendataan.tanggalMulai),
      tanggalSelesai: toYyyyMmDd(ownPendataan.tanggalSelesai),
      statusPendataan: ownPendataan.statusPendataan,
      dosenPembimbing: ownPendataan.dosenPembimbing,
    };
    periodForStats = {
      tanggalMulai: ownPendataan.tanggalMulai,
      tanggalSelesai: ownPendataan.tanggalSelesai,
    };
  } else if (query.pendataanId) {
    const requestedPendataan = await prisma.pendataanMagang.findUnique({
      where: { id: query.pendataanId },
      include: {
        dosenPembimbing: {
          select: {
            id: true,
            nip: true,
            namaBergelar: true,
          },
        },
      },
    });

    if (!requestedPendataan) {
      throw new ApiHttpError(404, "Data pendataan magang tidak ditemukan.");
    }

    if (context.user.role === "DOSEN") {
      if (!context.dosen) {
        throw new ApiHttpError(403, "Profil dosen tidak ditemukan.");
      }
      const allowedCount = await prisma.pendataanMagang.count({
        where: {
          id: requestedPendataan.id,
          ...buildDosenReadablePendataanWhere(context.dosen.id),
        },
      });
      if (allowedCount === 0) {
        throw new ApiHttpError(
          403,
          "Anda tidak berwenang melihat daftar logbook pada pendataan ini.",
        );
      }
    }

    pendataanContext = {
      id: requestedPendataan.id,
      namaInstansi: requestedPendataan.namaInstansi,
      posisi: requestedPendataan.posisi,
      tanggalMulai: toYyyyMmDd(requestedPendataan.tanggalMulai),
      tanggalSelesai: toYyyyMmDd(requestedPendataan.tanggalSelesai),
      statusPendataan: requestedPendataan.statusPendataan,
      dosenPembimbing: requestedPendataan.dosenPembimbing,
    };
    periodForStats = {
      tanggalMulai: requestedPendataan.tanggalMulai,
      tanggalSelesai: requestedPendataan.tanggalSelesai,
    };
  }

  const pendataanScopeWhere: Prisma.PendataanMagangWhereInput =
    context.user.role === "MAHASISWA" && pendataanContext
      ? { id: pendataanContext.id }
      : context.user.role === "DOSEN" && context.dosen
        ? {
            ...(query.pendataanId
              ? { id: query.pendataanId }
              : { dosenPembimbingId: context.dosen.id }),
            ...(targetSemesterId ? { semesterId: targetSemesterId } : {}),
          }
        : {
            ...(query.pendataanId ? { id: query.pendataanId } : {}),
            ...(targetSemesterId ? { semesterId: targetSemesterId } : {}),
          };

  const baseScopeWhere: Prisma.LogbookWhereInput = {
    pendataan: pendataanScopeWhere,
  };

  const filteredWhere: Prisma.LogbookWhereInput = {
    ...baseScopeWhere,
    ...(query.jenisCatatan ? { jenisCatatan: query.jenisCatatan } : {}),
    ...(query.statusValidasi ? { statusValidasi: query.statusValidasi } : {}),
    ...(query.q
      ? {
          OR: [
            { deskripsiKegiatan: { contains: query.q } },
            {
              pendataan: {
                OR: [
                  { namaInstansi: { contains: query.q } },
                  {
                    mahasiswa: {
                      OR: [
                        { nim: { contains: query.q } },
                        { user: { nama: { contains: query.q } } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const skip = (query.page - 1) * query.limit;

  const [rows, totalItems, allScopeEntries] = await Promise.all([
    prisma.logbook.findMany({
      where: filteredWhere,
      skip,
      take: query.limit,
      include: logbookDetailInclude,
      orderBy: [{ mingguKe: "desc" }, { tanggal: "desc" }, { createdAt: "desc" }],
    }),
    prisma.logbook.count({ where: filteredWhere }),
    prisma.logbook.findMany({
      where: baseScopeWhere,
      select: {
        mingguKe: true,
        statusValidasi: true,
      },
    }),
  ]);

  const stats = computeLogbookSummaryStats(
    allScopeEntries,
    pendataanContext && pendataanContext.statusPendataan === StatusPendataan.TERVERIFIKASI
      ? periodForStats
      : null,
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / query.limit));

  return {
    pendataanContext,
    stats,
    items: rows.map(mapLogbookItemDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
    },
  };
}

export async function getLogbookDetail(
  context: ApiAuthContext,
  logbookId: string,
): Promise<LogbookItemDto> {
  const row = await prisma.logbook.findUnique({
    where: { id: logbookId },
    include: logbookDetailInclude,
  });

  if (!row) {
    throw new ApiHttpError(404, "Catatan logbook tidak ditemukan.");
  }

  await assertCanReadLogbookRow(context, row);
  return mapLogbookItemDto(row);
}

export async function createMahasiswaLogbook(
  context: ApiAuthContext,
  input: ParsedCreateLogbook,
): Promise<LogbookItemDto> {
  if (!context.mahasiswa || !context.mahasiswa.statusAktif) {
    throw new ApiHttpError(
      403,
      "Hanya mahasiswa berstatus aktif yang dapat mencatat kegiatan logbook.",
    );
  }

  const activeSem = await prisma.periodeSemester.findFirst({
    where: { isAktif: true },
    orderBy: { kodeSemester: "desc" },
    select: { id: true },
  });

  if (!activeSem) {
    throw new ApiHttpError(
      400,
      "Periode semester aktif belum tersedia pada sistem.",
    );
  }

  const pendataan = await prisma.pendataanMagang.findUnique({
    where: {
      mahasiswaId_semesterId: {
        mahasiswaId: context.mahasiswa.id,
        semesterId: activeSem.id,
      },
    },
  });

  if (!pendataan || pendataan.statusPendataan !== StatusPendataan.TERVERIFIKASI) {
    throw new ApiHttpError(
      400,
      "Pencatatan logbook hanya dapat dilakukan setelah pengajuan pendataan magang pada semester aktif diverifikasi.",
    );
  }

  assertDateWithinPeriod(
    input.tanggal,
    pendataan.tanggalMulai,
    pendataan.tanggalSelesai,
  );

  const created = await prisma.logbook.create({
    data: {
      pendataanId: pendataan.id,
      jenisCatatan: input.jenisCatatan,
      tanggal: input.tanggal,
      mingguKe: input.mingguKe,
      deskripsiKegiatan: input.deskripsiKegiatan,
      fotoBuktiUrl: input.fotoBuktiUrl,
      namaFileBukti: input.namaFileBukti,
      statusValidasi: StatusValidasiLogbook.MENUNGGU_VALIDASI,
    },
    include: logbookDetailInclude,
  });

  return mapLogbookItemDto(created);
}

export async function updateMahasiswaLogbook(
  context: ApiAuthContext,
  logbookId: string,
  input: ParsedUpdateLogbook,
): Promise<LogbookItemDto> {
  if (!context.mahasiswa) {
    throw new ApiHttpError(
      403,
      "Hanya akun Mahasiswa yang dapat memperbarui catatan logbook.",
    );
  }

  const existing = await prisma.logbook.findUnique({
    where: { id: logbookId },
    include: {
      pendataan: true,
    },
  });

  if (!existing) {
    throw new ApiHttpError(404, "Catatan logbook tidak ditemukan.");
  }

  if (existing.pendataan.mahasiswaId !== context.mahasiswa.id) {
    throw new ApiHttpError(
      403,
      "Anda tidak berwenang mengubah catatan logbook milik mahasiswa lain.",
    );
  }

  if (existing.statusValidasi === StatusValidasiLogbook.TERVALIDASI) {
    throw new ApiHttpError(
      409,
      "Catatan logbook yang telah divalidasi oleh dosen pembimbing terkunci dan tidak dapat diubah.",
    );
  }

  if (input.tanggal) {
    assertDateWithinPeriod(
      input.tanggal,
      existing.pendataan.tanggalMulai,
      existing.pendataan.tanggalSelesai,
    );
  }

  const updated = await prisma.logbook.update({
    where: { id: logbookId },
    data: {
      ...(input.jenisCatatan !== undefined
        ? { jenisCatatan: input.jenisCatatan }
        : {}),
      ...(input.tanggal !== undefined ? { tanggal: input.tanggal } : {}),
      ...(input.mingguKe !== undefined ? { mingguKe: input.mingguKe } : {}),
      ...(input.deskripsiKegiatan !== undefined
        ? { deskripsiKegiatan: input.deskripsiKegiatan }
        : {}),
      ...(input.fotoBuktiUrl !== undefined
        ? { fotoBuktiUrl: input.fotoBuktiUrl }
        : {}),
      ...(input.namaFileBukti !== undefined
        ? { namaFileBukti: input.namaFileBukti }
        : {}),
      // Kembalikan ke antrean pemeriksaan pembimbing saat mahasiswa memperbaiki catatan yang perlu revisi.
      statusValidasi: StatusValidasiLogbook.MENUNGGU_VALIDASI,
      validatedAt: null,
    },
    include: logbookDetailInclude,
  });

  return mapLogbookItemDto(updated);
}

export async function deleteMahasiswaLogbook(
  context: ApiAuthContext,
  logbookId: string,
): Promise<void> {
  if (!context.mahasiswa) {
    throw new ApiHttpError(
      403,
      "Hanya akun Mahasiswa yang dapat menghapus catatan logbook.",
    );
  }

  const existing = await prisma.logbook.findUnique({
    where: { id: logbookId },
    include: {
      pendataan: {
        select: { mahasiswaId: true },
      },
    },
  });

  if (!existing) {
    throw new ApiHttpError(404, "Catatan logbook tidak ditemukan.");
  }

  if (existing.pendataan.mahasiswaId !== context.mahasiswa.id) {
    throw new ApiHttpError(
      403,
      "Anda tidak berwenang menghapus catatan logbook milik mahasiswa lain.",
    );
  }

  if (existing.statusValidasi === StatusValidasiLogbook.TERVALIDASI) {
    throw new ApiHttpError(
      409,
      "Catatan logbook yang telah divalidasi oleh dosen pembimbing tidak dapat dihapus.",
    );
  }

  await prisma.logbook.delete({
    where: { id: logbookId },
  });
}

export async function validateLogbookByPembimbing(
  context: ApiAuthContext,
  logbookId: string,
  decision: ValidasiLogbookDecisionInput,
): Promise<LogbookItemDto> {
  if (!context.dosen) {
    throw new ApiHttpError(
      403,
      "Hanya akun Dosen Pembimbing yang dapat memvalidasi catatan logbook.",
    );
  }

  const existing = await prisma.logbook.findUnique({
    where: { id: logbookId },
    include: {
      pendataan: {
        select: {
          dosenPembimbingId: true,
          statusPendataan: true,
        },
      },
    },
  });

  if (!existing) {
    throw new ApiHttpError(404, "Catatan logbook tidak ditemukan.");
  }

  if (existing.pendataan.dosenPembimbingId !== context.dosen.id) {
    throw new ApiHttpError(
      403,
      "Hanya Dosen Pembimbing UPI yang ditugaskan pada mahasiswa ini yang berwenang memvalidasi logbook.",
    );
  }

  if (existing.pendataan.statusPendataan !== StatusPendataan.TERVERIFIKASI) {
    throw new ApiHttpError(
      400,
      "Validasi logbook hanya berlaku bagi pendataan magang yang berstatus terverifikasi.",
    );
  }

  const updated = await prisma.logbook.update({
    where: { id: logbookId },
    data: {
      statusValidasi: decision.statusValidasi,
      catatanPembimbing: decision.catatanPembimbing ?? null,
      validatedByDosenId: context.dosen.id,
      validatedAt: new Date(),
    },
    include: logbookDetailInclude,
  });

  return mapLogbookItemDto(updated);
}
