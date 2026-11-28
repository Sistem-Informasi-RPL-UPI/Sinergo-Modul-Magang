import {
  JenisDokumenSk,
  type Prisma,
  StatusPendataan,
  StatusPengesahanSk,
} from "@prisma/client";
import type {
  GenerateSkInput,
  ParsedPlotDosenKunjung,
  ParsedSksListQuery,
} from "@/features/pendataans/schemas/sk.schema";
import { getPendataanDetailForManager } from "@/features/pendataans/services/pendataan.server";
import type { PendataanDetailDto } from "@/features/pendataans/types/pendataan.type";
import type {
  DokumenSkDetailDto,
  DokumenSksListResponseDto,
  GenerateSkResponseDto,
} from "@/features/pendataans/types/sk.type";
import type { ApiAuthContext } from "@/libs/api-auth";
import { prisma } from "@/libs/prisma";
import { ApiHttpError } from "@/utils/api-error";
import { buildOfficialSkPdfBuffer } from "@/utils/sk-pdf-builder";

const skDetailInclude = {
  generatedByUser: {
    select: {
      id: true,
      nama: true,
    },
  },
  disahkanKaprodi: {
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
            select: {
              nama: true,
            },
          },
        },
      },
      semester: true,
      dosenPembimbing: {
        select: {
          id: true,
          nip: true,
          namaBergelar: true,
        },
      },
      dosenKunjung: {
        select: {
          id: true,
          nip: true,
          namaBergelar: true,
        },
      },
      konversiMks: {
        include: {
          matakuliah: {
            select: {
              kodeMk: true,
              namaMk: true,
            },
          },
        },
        orderBy: {
          matakuliah: {
            kodeMk: "asc" as const,
          },
        },
      },
    },
  },
} satisfies Prisma.DokumenSkInclude;

type DokumenSkWithRelations = Prisma.DokumenSkGetPayload<{
  include: typeof skDetailInclude;
}>;

function buildCanonicalSkDownloadUrl(skId: string): string {
  return `/api/sks/${skId}/unduh`;
}

function getJenisSkShortCode(jenisSk: JenisDokumenSk): string {
  switch (jenisSk) {
    case JenisDokumenSk.SK_PENUGASAN:
      return "TGS";
    case JenisDokumenSk.SK_PEMBIMBING:
      return "PBB";
    case JenisDokumenSk.SK_KUNJUNG_LAPANGAN:
      return "KNJ";
  }
}

function buildAutoNomorSk(
  jenisSk: JenisDokumenSk,
  nim: string,
  sequenceNumber: number,
): string {
  const year = new Date().getFullYear();
  const seq = String(sequenceNumber).padStart(3, "0");
  const code = getJenisSkShortCode(jenisSk);
  return `${seq}/${code}.${nim}/UN40.C10.RPL/PK.01.06/${year}`;
}

function mapDokumenSkDetailDto(row: DokumenSkWithRelations): DokumenSkDetailDto {
  const totalSksKonversi = row.pendataan.konversiMks.reduce(
    (sum, km) => sum + km.sksKonversi,
    0,
  );

  return {
    id: row.id,
    pendataanId: row.pendataanId,
    nomorSk: row.nomorSk,
    jenisSk: row.jenisSk,
    fileSkUrl: buildCanonicalSkDownloadUrl(row.id),
    statusPengesahan: row.statusPengesahan,
    tanggalDibuat: row.tanggalDibuat.toISOString(),
    tanggalDisahkan: row.tanggalDisahkan
      ? row.tanggalDisahkan.toISOString()
      : null,
    generatedBy: {
      id: row.generatedByUser.id,
      nama: row.generatedByUser.nama,
    },
    disahkanKaprodi: row.disahkanKaprodi,
    pendataan: {
      id: row.pendataan.id,
      namaInstansi: row.pendataan.namaInstansi,
      posisi: row.pendataan.posisi,
      jenisProgram: row.pendataan.jenisProgram,
      tanggalMulai: row.pendataan.tanggalMulai.toISOString().slice(0, 10),
      tanggalSelesai: row.pendataan.tanggalSelesai.toISOString().slice(0, 10),
      mahasiswa: {
        id: row.pendataan.mahasiswa.id,
        nim: row.pendataan.mahasiswa.nim,
        nama: row.pendataan.mahasiswa.user.nama,
        angkatan: row.pendataan.mahasiswa.angkatan,
      },
      semester: {
        id: row.pendataan.semester.id,
        kodeSemester: row.pendataan.semester.kodeSemester,
        namaSemester: row.pendataan.semester.namaSemester,
        jenisSemester: row.pendataan.semester.jenisSemester,
        isAktif: row.pendataan.semester.isAktif,
      },
      dosenPembimbing: row.pendataan.dosenPembimbing,
      dosenKunjung: row.pendataan.dosenKunjung,
      totalSksKonversi,
    },
  };
}

export async function plotDosenKunjungForPendataan(
  pendataanId: string,
  input: ParsedPlotDosenKunjung,
): Promise<PendataanDetailDto> {
  const existing = await prisma.pendataanMagang.findUnique({
    where: { id: pendataanId },
    include: {
      dokumenSks: {
        where: {
          jenisSk: JenisDokumenSk.SK_KUNJUNG_LAPANGAN,
          statusPengesahan: StatusPengesahanSk.DISAHKAN,
        },
        select: { id: true },
      },
    },
  });

  if (!existing) {
    throw new ApiHttpError(404, "Data pendataan magang tidak ditemukan.");
  }

  if (existing.statusPendataan !== StatusPendataan.TERVERIFIKASI) {
    throw new ApiHttpError(
      400,
      "Penetapan Pembimbing Lapangan (Dosen Kunjung) hanya dapat dilakukan pada pendataan yang telah terverifikasi.",
    );
  }

  if (existing.dokumenSks.length > 0) {
    throw new ApiHttpError(
      409,
      "Pembimbing Lapangan tidak dapat diubah karena SK Kunjung Lapangan telah disahkan oleh Kaprodi.",
    );
  }

  if (input.dosenKunjungId) {
    const dosen = await prisma.dosen.findUnique({
      where: { id: input.dosenKunjungId },
      select: { id: true, statusAktif: true },
    });

    if (!dosen || !dosen.statusAktif) {
      throw new ApiHttpError(
        400,
        "Dosen Kunjung yang dipilih tidak ditemukan atau berstatus tidak aktif.",
      );
    }
  }

  await prisma.pendataanMagang.update({
    where: { id: pendataanId },
    data: {
      dosenKunjungId: input.dosenKunjungId,
    },
  });

  return getPendataanDetailForManager(pendataanId);
}

export async function listDokumenSks(
  context: ApiAuthContext,
  query: ParsedSksListQuery,
): Promise<DokumenSksListResponseDto> {
  const isManager =
    context.user.role === "ADMIN" || context.user.role === "KAPRODI";

  const roleConstraint: Prisma.DokumenSkWhereInput = isManager
    ? {}
    : context.user.role === "MAHASISWA" && context.mahasiswa
      ? {
          statusPengesahan: StatusPengesahanSk.DISAHKAN,
          pendataan: {
            mahasiswaId: context.mahasiswa.id,
          },
        }
      : context.dosen
        ? {
            statusPengesahan: StatusPengesahanSk.DISAHKAN,
            pendataan: {
              OR: [
                { dosenPembimbingId: context.dosen.id },
                { dosenKunjungId: context.dosen.id },
              ],
            },
          }
        : { id: "__no_access__" };

  const pendataanFilters: Prisma.PendataanMagangWhereInput = {
    ...(query.semesterId ? { semesterId: query.semesterId } : {}),
    ...(query.q
      ? {
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
        }
      : {}),
  };

  const where: Prisma.DokumenSkWhereInput = {
    AND: [
      roleConstraint,
      {
        ...(query.pendataanId ? { pendataanId: query.pendataanId } : {}),
        ...(query.jenisSk ? { jenisSk: query.jenisSk } : {}),
        ...(isManager && query.statusPengesahan
          ? { statusPengesahan: query.statusPengesahan }
          : {}),
        ...(Object.keys(pendataanFilters).length > 0
          ? { pendataan: pendataanFilters }
          : {}),
      },
    ],
  };

  const skip = (query.page - 1) * query.limit;

  const [rows, totalItems] = await Promise.all([
    prisma.dokumenSk.findMany({
      where,
      skip,
      take: query.limit,
      include: skDetailInclude,
      orderBy: [{ tanggalDibuat: "desc" }],
    }),
    prisma.dokumenSk.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / query.limit));

  return {
    items: rows.map(mapDokumenSkDetailDto),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
    },
  };
}

export async function generateDrafDokumenSks(
  context: ApiAuthContext,
  input: GenerateSkInput,
): Promise<GenerateSkResponseDto> {
  const savedSkIds = await prisma.$transaction(async (tx) => {
    const pendataan = await tx.pendataanMagang.findUnique({
      where: { id: input.pendataanId },
      include: {
        mahasiswa: {
          select: { nim: true },
        },
        dokumenSks: true,
      },
    });

    if (!pendataan) {
      throw new ApiHttpError(404, "Data pendataan magang tidak ditemukan.");
    }

    if (pendataan.statusPendataan !== StatusPendataan.TERVERIFIKASI) {
      throw new ApiHttpError(
        400,
        "Otomatisasi generasi draf SK hanya dapat dijalankan pada pendataan berstatus terverifikasi.",
      );
    }

    if (
      input.jenisSks.includes(JenisDokumenSk.SK_KUNJUNG_LAPANGAN) &&
      !pendataan.dosenKunjungId
    ) {
      throw new ApiHttpError(
        400,
        "Pembimbing Lapangan (Dosen Kunjung) wajib ditetapkan terlebih dahulu sebelum men-generate SK Kunjung Lapangan.",
      );
    }

    const existingMap = new Map(
      pendataan.dokumenSks.map((sk) => [sk.jenisSk, sk]),
    );

    for (const jenisSk of input.jenisSks) {
      const existingSk = existingMap.get(jenisSk);
      if (existingSk?.statusPengesahan === StatusPengesahanSk.DISAHKAN) {
        throw new ApiHttpError(
          409,
          `Dokumen ${jenisSk} untuk mahasiswa ini telah disahkan oleh Kaprodi dan terkunci permanen.`,
        );
      }
    }

    let currentCount = await tx.dokumenSk.count();
    const now = new Date();
    const ids: string[] = [];

    for (const jenisSk of input.jenisSks) {
      currentCount += 1;
      const customNomor =
        input.nomorSkMap?.[jenisSk] ??
        (input.jenisSks.length === 1 ? input.nomorSk : undefined);

      const nomorSk =
        customNomor ??
        buildAutoNomorSk(jenisSk, pendataan.mahasiswa.nim, currentCount);

      const upserted = await tx.dokumenSk.upsert({
        where: {
          pendataanId_jenisSk: {
            pendataanId: pendataan.id,
            jenisSk,
          },
        },
        update: {
          generatedByUserId: context.user.id,
          disahkanKaprodiId: null,
          nomorSk,
          statusPengesahan: StatusPengesahanSk.DRAF_MENUNGGU,
          tanggalDibuat: now,
          tanggalDisahkan: null,
        },
        create: {
          pendataanId: pendataan.id,
          generatedByUserId: context.user.id,
          nomorSk,
          jenisSk,
          fileSkUrl: "/api/sks/pending/unduh",
          statusPengesahan: StatusPengesahanSk.DRAF_MENUNGGU,
          tanggalDibuat: now,
        },
      });

      const canonicalUrl = buildCanonicalSkDownloadUrl(upserted.id);
      if (upserted.fileSkUrl !== canonicalUrl) {
        await tx.dokumenSk.update({
          where: { id: upserted.id },
          data: { fileSkUrl: canonicalUrl },
        });
      }

      ids.push(upserted.id);
    }

    return ids;
  });

  const rows = await prisma.dokumenSk.findMany({
    where: { id: { in: savedSkIds } },
    include: skDetailInclude,
    orderBy: { tanggalDibuat: "asc" },
  });

  return {
    pendataanId: input.pendataanId,
    generatedCount: rows.length,
    items: rows.map(mapDokumenSkDetailDto),
  };
}

export async function sahkanDokumenSkByKaprodi(
  context: ApiAuthContext,
  skId: string,
): Promise<DokumenSkDetailDto> {
  if (context.user.role !== "KAPRODI" || !context.dosen) {
    throw new ApiHttpError(
      403,
      "Hanya Ketua Program Studi (Kaprodi) yang berwenang mengesahkan Surat Keputusan secara resmi.",
    );
  }

  const kaprodiDosenId = context.dosen.id;

  await prisma.$transaction(async (tx) => {
    const existing = await tx.dokumenSk.findUnique({
      where: { id: skId },
      include: {
        pendataan: {
          select: {
            statusPendataan: true,
            dosenKunjungId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new ApiHttpError(404, "Dokumen SK tidak ditemukan.");
    }

    if (existing.statusPengesahan === StatusPengesahanSk.DISAHKAN) {
      throw new ApiHttpError(
        409,
        "Dokumen SK ini telah disahkan sebelumnya.",
      );
    }

    if (existing.pendataan.statusPendataan !== StatusPendataan.TERVERIFIKASI) {
      throw new ApiHttpError(
        400,
        "Dokumen SK tidak dapat disahkan karena pendataan mahasiswa belum berstatus terverifikasi.",
      );
    }

    if (
      existing.jenisSk === JenisDokumenSk.SK_KUNJUNG_LAPANGAN &&
      !existing.pendataan.dosenKunjungId
    ) {
      throw new ApiHttpError(
        400,
        "SK Kunjung Lapangan tidak dapat disahkan sebelum Dosen Kunjung ditetapkan.",
      );
    }

    await tx.dokumenSk.update({
      where: { id: skId },
      data: {
        statusPengesahan: StatusPengesahanSk.DISAHKAN,
        disahkanKaprodiId: kaprodiDosenId,
        tanggalDisahkan: new Date(),
        fileSkUrl: buildCanonicalSkDownloadUrl(skId),
      },
    });
  });

  const updated = await prisma.dokumenSk.findUniqueOrThrow({
    where: { id: skId },
    include: skDetailInclude,
  });

  return mapDokumenSkDetailDto(updated);
}

export async function getAuthorizedSkPdf(
  context: ApiAuthContext,
  skId: string,
): Promise<{
  pdfBuffer: Buffer;
  fileName: string;
}> {
  const row = await prisma.dokumenSk.findUnique({
    where: { id: skId },
    include: skDetailInclude,
  });

  if (!row) {
    throw new ApiHttpError(404, "Dokumen SK tidak ditemukan.");
  }

  const isManager =
    context.user.role === "ADMIN" || context.user.role === "KAPRODI";

  if (!isManager) {
    if (row.statusPengesahan !== StatusPengesahanSk.DISAHKAN) {
      throw new ApiHttpError(
        403,
        "Dokumen SK ini masih berupa draf dan belum disahkan oleh Ketua Program Studi.",
      );
    }

    if (context.user.role === "MAHASISWA") {
      if (
        !context.mahasiswa ||
        row.pendataan.mahasiswaId !== context.mahasiswa.id
      ) {
        throw new ApiHttpError(
          403,
          "Anda tidak berwenang mengakses dokumen SK milik mahasiswa lain.",
        );
      }
    } else if (context.user.role === "DOSEN") {
      const isAssignedDosen =
        Boolean(context.dosen) &&
        (row.pendataan.dosenPembimbingId === context.dosen?.id ||
          row.pendataan.dosenKunjungId === context.dosen?.id);

      if (!isAssignedDosen) {
        throw new ApiHttpError(
          403,
          "Anda tidak tercatat sebagai Dosen Pembimbing atau Dosen Kunjung pada Surat Keputusan ini.",
        );
      }
    }
  }

  const pdfBuffer = buildOfficialSkPdfBuffer({
    nomorSk: row.nomorSk,
    jenisSk: row.jenisSk,
    statusPengesahan: row.statusPengesahan,
    tanggalDibuat: row.tanggalDibuat,
    tanggalDisahkan: row.tanggalDisahkan,
    mahasiswa: {
      nama: row.pendataan.mahasiswa.user.nama,
      nim: row.pendataan.mahasiswa.nim,
      prodi: row.pendataan.mahasiswa.prodi,
      angkatan: row.pendataan.mahasiswa.angkatan,
    },
    semester: {
      namaSemester: row.pendataan.semester.namaSemester,
      kodeSemester: row.pendataan.semester.kodeSemester,
    },
    pendataan: {
      namaInstansi: row.pendataan.namaInstansi,
      alamatInstansi: row.pendataan.alamatInstansi,
      posisi: row.pendataan.posisi,
      jenisProgram: row.pendataan.jenisProgram,
      tanggalMulai: row.pendataan.tanggalMulai,
      tanggalSelesai: row.pendataan.tanggalSelesai,
    },
    dosenPembimbing: {
      namaBergelar: row.pendataan.dosenPembimbing.namaBergelar,
      nip: row.pendataan.dosenPembimbing.nip,
    },
    dosenKunjung: row.pendataan.dosenKunjung
      ? {
          namaBergelar: row.pendataan.dosenKunjung.namaBergelar,
          nip: row.pendataan.dosenKunjung.nip,
        }
      : null,
    kaprodiPengesah: row.disahkanKaprodi
      ? {
          namaBergelar: row.disahkanKaprodi.namaBergelar,
          nip: row.disahkanKaprodi.nip,
        }
      : null,
    konversiMks: row.pendataan.konversiMks.map((km) => ({
      kodeMk: km.matakuliah.kodeMk,
      namaMk: km.matakuliah.namaMk,
      sks: km.sksKonversi,
    })),
  });

  const prefix =
    row.statusPengesahan === StatusPengesahanSk.DISAHKAN ? "RESMI" : "DRAF";
  const fileName = `${prefix}_${row.jenisSk}_${row.pendataan.mahasiswa.nim}.pdf`;

  return {
    pdfBuffer,
    fileName,
  };
}
