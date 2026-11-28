import {
  type Prisma,
  StatusBerkasAkhir,
  StatusPendataan,
  StatusPengesahanSk,
  StatusPenilaianKonversi,
} from "@prisma/client";
import type {
  ParsedRekapPendataansQuery,
  ParsedSavePendataanDraft,
  ParsedSubmitPendataan,
  PendataanOwnQueryInput,
  VerifikasiPendataanDecisionInput,
} from "@/features/pendataans/schemas/pendataan.schema";
import type {
  MahasiswaPendataanOwnResponseDto,
  PendataanDetailDto,
  RekapPendataansListResponseDto,
} from "@/features/pendataans/types/pendataan.type";
import type { ApiAuthContext } from "@/libs/api-auth";
import { prisma } from "@/libs/prisma";
import { ApiHttpError } from "@/utils/api-error";
import { resolveKategoriAnalitikMbkm } from "@/utils/grade-converter";

function isPdfFileUrl(fileUrl: string): boolean {
  const cleanPath = fileUrl.split("?")[0]?.split("#")[0] ?? "";
  return cleanPath.toLowerCase().endsWith(".pdf");
}

function countUploadedBerkasSlots(slots: {
  loaUrl: string | null;
  rubrikKonversiUrl: string | null;
  laporanAkhirUrl: string | null;
  drafPksUrl: string | null;
  transkripInstansiUrl: string | null;
  sertifikatUrl: string | null;
}): { jumlahTerunggah: number; progresPersen: number } {
  const urls = [
    slots.loaUrl,
    slots.rubrikKonversiUrl,
    slots.laporanAkhirUrl,
    slots.drafPksUrl,
    slots.transkripInstansiUrl,
    slots.sertifikatUrl,
  ];
  const jumlahTerunggah = urls.filter((u) => Boolean(u && u.trim())).length;
  const progresPersen = Math.round((jumlahTerunggah / 6) * 100);
  return { jumlahTerunggah, progresPersen };
}

const pendataanDetailInclude = {
  mahasiswa: {
    include: {
      user: {
        select: {
          nama: true,
          email: true,
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
  verifiedByUser: {
    select: {
      id: true,
      nama: true,
    },
  },
  konversiMks: {
    include: {
      matakuliah: {
        include: {
          dosenPengampu: {
            select: {
              id: true,
              nip: true,
              namaBergelar: true,
            },
          },
        },
      },
    },
    orderBy: {
      matakuliah: {
        kodeMk: "asc" as const,
      },
    },
  },
  dokumenSks: {
    orderBy: {
      tanggalDibuat: "asc" as const,
    },
  },
  berkasAkhir: true,
} satisfies Prisma.PendataanMagangInclude;

type PendataanWithRelations = Prisma.PendataanMagangGetPayload<{
  include: typeof pendataanDetailInclude;
}>;

function mapPendataanDetailDto(
  row: PendataanWithRelations,
  options: { onlyApprovedSk: boolean },
): PendataanDetailDto {
  const konversiMks = row.konversiMks.map((km) => ({
    id: km.id,
    matakuliahId: km.matakuliahId,
    kodeMk: km.matakuliah.kodeMk,
    namaMk: km.matakuliah.namaMk,
    sksKonversi: km.sksKonversi,
    tingkatKesesuaian: km.tingkatKesesuaian,
    statusPenilaian: km.statusPenilaian,
    dosenPengampu: {
      id: km.matakuliah.dosenPengampu.id,
      nip: km.matakuliah.dosenPengampu.nip,
      namaBergelar: km.matakuliah.dosenPengampu.namaBergelar,
    },
  }));

  const totalSksKonversi = konversiMks.reduce(
    (sum, item) => sum + item.sksKonversi,
    0,
  );

  const visibleSks = options.onlyApprovedSk
    ? row.dokumenSks.filter(
        (sk) => sk.statusPengesahan === StatusPengesahanSk.DISAHKAN,
      )
    : row.dokumenSks;

  return {
    id: row.id,
    mahasiswa: {
      id: row.mahasiswa.id,
      nim: row.mahasiswa.nim,
      nama: row.mahasiswa.user.nama,
      email: row.mahasiswa.user.email,
      prodi: row.mahasiswa.prodi,
      angkatan: row.mahasiswa.angkatan,
    },
    semester: {
      id: row.semester.id,
      kodeSemester: row.semester.kodeSemester,
      namaSemester: row.semester.namaSemester,
      jenisSemester: row.semester.jenisSemester,
      isAktif: row.semester.isAktif,
    },
    namaInstansi: row.namaInstansi,
    alamatInstansi: row.alamatInstansi,
    kontakInstansi: row.kontakInstansi,
    posisi: row.posisi,
    jenisProgram: row.jenisProgram,
    kategoriAnalitik: row.kategoriAnalitik,
    modeKegiatan: row.modeKegiatan,
    tanggalMulai: row.tanggalMulai.toISOString().slice(0, 10),
    tanggalSelesai: row.tanggalSelesai.toISOString().slice(0, 10),
    fileLoaAwalUrl: row.fileLoaAwalUrl,
    fileLoaAwalNama: row.fileLoaAwalNama,
    pernyataanBenar: row.pernyataanBenar,
    statusPendataan: row.statusPendataan,
    catatanRevisi: row.catatanRevisi,
    isEditable:
      row.statusPendataan === StatusPendataan.DRAF ||
      row.statusPendataan === StatusPendataan.PERLU_REVISI,
    dosenPembimbing: row.dosenPembimbing,
    dosenKunjung: row.dosenKunjung,
    verifiedBy: row.verifiedByUser
      ? {
          id: row.verifiedByUser.id,
          nama: row.verifiedByUser.nama,
        }
      : null,
    submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
    verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
    totalMkKonversi: konversiMks.length,
    totalSksKonversi,
    konversiMks,
    dokumenSks: visibleSks.map((sk) => ({
      id: sk.id,
      nomorSk: sk.nomorSk,
      jenisSk: sk.jenisSk,
      fileSkUrl: `/api/sks/${sk.id}/unduh`,
      statusPengesahan: sk.statusPengesahan,
      tanggalDibuat: sk.tanggalDibuat.toISOString(),
      tanggalDisahkan: sk.tanggalDisahkan
        ? sk.tanggalDisahkan.toISOString()
        : null,
    })),
    berkasAkhir: row.berkasAkhir
      ? {
          id: row.berkasAkhir.id,
          jumlahTerunggah: row.berkasAkhir.jumlahTerunggah,
          progresPersen: row.berkasAkhir.progresPersen,
          statusBerkas: row.berkasAkhir.statusBerkas,
          submittedAt: row.berkasAkhir.submittedAt
            ? row.berkasAkhir.submittedAt.toISOString()
            : null,
        }
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getOwnMahasiswaPendataan(
  context: ApiAuthContext,
  query: PendataanOwnQueryInput,
): Promise<MahasiswaPendataanOwnResponseDto> {
  if (!context.mahasiswa) {
    throw new ApiHttpError(
      403,
      "Hanya akun Mahasiswa yang memiliki data pengajuan pendataan.",
    );
  }

  const semester = query.semesterId
    ? await prisma.periodeSemester.findUnique({
        where: { id: query.semesterId },
      })
    : await prisma.periodeSemester.findFirst({
        where: { isAktif: true },
        orderBy: { kodeSemester: "desc" },
      });

  if (!semester) {
    return {
      semester: null,
      pendataan: null,
    };
  }

  const row = await prisma.pendataanMagang.findUnique({
    where: {
      mahasiswaId_semesterId: {
        mahasiswaId: context.mahasiswa.id,
        semesterId: semester.id,
      },
    },
    include: pendataanDetailInclude,
  });

  return {
    semester: {
      id: semester.id,
      kodeSemester: semester.kodeSemester,
      namaSemester: semester.namaSemester,
      jenisSemester: semester.jenisSemester,
      isAktif: semester.isAktif,
    },
    pendataan: row
      ? mapPendataanDetailDto(row, { onlyApprovedSk: true })
      : null,
  };
}

export async function saveOrSubmitMahasiswaPendataan(
  context: ApiAuthContext,
  input: ParsedSavePendataanDraft | ParsedSubmitPendataan,
  mode: "DRAFT" | "SUBMIT",
): Promise<PendataanDetailDto> {
  if (!context.mahasiswa) {
    throw new ApiHttpError(
      403,
      "Hanya akun Mahasiswa yang dapat menyimpan atau mengirim pendataan magang.",
    );
  }

  if (!context.mahasiswa.statusAktif) {
    throw new ApiHttpError(
      403,
      "Status akademik mahasiswa tidak aktif sehingga tidak dapat mengajukan pendataan.",
    );
  }

  const mahasiswaId = context.mahasiswa.id;

  const semester = input.semesterId
    ? await prisma.periodeSemester.findUnique({
        where: { id: input.semesterId },
      })
    : await prisma.periodeSemester.findFirst({
        where: { isAktif: true },
        orderBy: { kodeSemester: "desc" },
      });

  if (!semester) {
    throw new ApiHttpError(
      400,
      "Periode semester aktif belum tersedia pada sistem.",
    );
  }

  if (!semester.isAktif) {
    throw new ApiHttpError(
      400,
      "Pengajuan atau perubahan pendataan hanya diizinkan pada periode semester yang sedang aktif.",
    );
  }

  const [dosenPembimbing, matakuliahs] = await Promise.all([
    prisma.dosen.findUnique({
      where: { id: input.dosenPembimbingId },
      select: { id: true, statusAktif: true },
    }),
    prisma.mataKuliah.findMany({
      where: {
        id: { in: input.matakuliahIds },
        isKonversiMbkm: true,
      },
      select: { id: true, sks: true },
    }),
  ]);

  if (!dosenPembimbing || !dosenPembimbing.statusAktif) {
    throw new ApiHttpError(
      400,
      "Dosen Pembimbing UPI tidak ditemukan atau berstatus tidak aktif.",
    );
  }

  if (matakuliahs.length !== input.matakuliahIds.length) {
    throw new ApiHttpError(
      400,
      "Terdapat mata kuliah pilihan yang tidak ditemukan atau tidak tersedia untuk konversi MBKM.",
    );
  }

  const mkSksMap = new Map(matakuliahs.map((mk) => [mk.id, mk.sks]));
  const kategoriAnalitik = resolveKategoriAnalitikMbkm(input.jenisProgram);

  const savedId = await prisma.$transaction(async (tx) => {
    const existing = await tx.pendataanMagang.findUnique({
      where: {
        mahasiswaId_semesterId: {
          mahasiswaId,
          semesterId: semester.id,
        },
      },
    });

    if (
      existing &&
      (existing.statusPendataan === StatusPendataan.MENUNGGU ||
        existing.statusPendataan === StatusPendataan.TERVERIFIKASI)
    ) {
      throw new ApiHttpError(
        409,
        "Data pendataan sedang menunggu verifikasi atau telah terverifikasi sehingga terkunci dari pengeditan.",
      );
    }

    const nextStatus =
      mode === "SUBMIT"
        ? StatusPendataan.MENUNGGU
        : existing?.statusPendataan === StatusPendataan.PERLU_REVISI
          ? StatusPendataan.PERLU_REVISI
          : StatusPendataan.DRAF;

    const now = new Date();

    const pendataan = existing
      ? await tx.pendataanMagang.update({
          where: { id: existing.id },
          data: {
            dosenPembimbingId: input.dosenPembimbingId,
            namaInstansi: input.namaInstansi,
            alamatInstansi: input.alamatInstansi,
            kontakInstansi: input.kontakInstansi,
            posisi: input.posisi,
            jenisProgram: input.jenisProgram,
            kategoriAnalitik,
            modeKegiatan: input.modeKegiatan,
            tanggalMulai: input.tanggalMulai,
            tanggalSelesai: input.tanggalSelesai,
            fileLoaAwalUrl: input.fileLoaAwalUrl,
            fileLoaAwalNama: input.fileLoaAwalNama,
            pernyataanBenar: input.pernyataanBenar,
            statusPendataan: nextStatus,
            ...(mode === "SUBMIT"
              ? {
                  submittedAt: now,
                  catatanRevisi: null,
                }
              : {}),
          },
        })
      : await tx.pendataanMagang.create({
          data: {
            mahasiswaId,
            semesterId: semester.id,
            dosenPembimbingId: input.dosenPembimbingId,
            namaInstansi: input.namaInstansi,
            alamatInstansi: input.alamatInstansi,
            kontakInstansi: input.kontakInstansi,
            posisi: input.posisi,
            jenisProgram: input.jenisProgram,
            kategoriAnalitik,
            modeKegiatan: input.modeKegiatan,
            tanggalMulai: input.tanggalMulai,
            tanggalSelesai: input.tanggalSelesai,
            fileLoaAwalUrl: input.fileLoaAwalUrl,
            fileLoaAwalNama: input.fileLoaAwalNama,
            pernyataanBenar: input.pernyataanBenar,
            statusPendataan: nextStatus,
            submittedAt: mode === "SUBMIT" ? now : null,
          },
        });

    await tx.konversiMataKuliah.deleteMany({
      where: {
        pendataanId: pendataan.id,
        matakuliahId: {
          notIn: input.matakuliahIds,
        },
      },
    });

    for (const mkId of input.matakuliahIds) {
      const sks = mkSksMap.get(mkId) ?? 3;
      await tx.konversiMataKuliah.upsert({
        where: {
          pendataanId_matakuliahId: {
            pendataanId: pendataan.id,
            matakuliahId: mkId,
          },
        },
        update: {
          sksKonversi: sks,
        },
        create: {
          pendataanId: pendataan.id,
          matakuliahId: mkId,
          sksKonversi: sks,
        },
      });
    }

    // Isi otomatis Slot 01 Letter of Acceptance pada Berkas Akhir apabila berkas LOA awal berformat PDF.
    if (mode === "SUBMIT" && isPdfFileUrl(input.fileLoaAwalUrl)) {
      const existingBerkas = await tx.berkasAkhir.findUnique({
        where: { pendataanId: pendataan.id },
      });

      if (!existingBerkas) {
        const progress = countUploadedBerkasSlots({
          loaUrl: input.fileLoaAwalUrl,
          rubrikKonversiUrl: null,
          laporanAkhirUrl: null,
          drafPksUrl: null,
          transkripInstansiUrl: null,
          sertifikatUrl: null,
        });

        await tx.berkasAkhir.create({
          data: {
            pendataanId: pendataan.id,
            loaUrl: input.fileLoaAwalUrl,
            loaUploadedAt: now,
            jumlahTerunggah: progress.jumlahTerunggah,
            progresPersen: progress.progresPersen,
            statusBerkas: StatusBerkasAkhir.DRAF,
          },
        });
      } else if (existingBerkas.statusBerkas === StatusBerkasAkhir.DRAF) {
        const progress = countUploadedBerkasSlots({
          loaUrl: input.fileLoaAwalUrl,
          rubrikKonversiUrl: existingBerkas.rubrikKonversiUrl,
          laporanAkhirUrl: existingBerkas.laporanAkhirUrl,
          drafPksUrl: existingBerkas.drafPksUrl,
          transkripInstansiUrl: existingBerkas.transkripInstansiUrl,
          sertifikatUrl: existingBerkas.sertifikatUrl,
        });

        await tx.berkasAkhir.update({
          where: { id: existingBerkas.id },
          data: {
            loaUrl: input.fileLoaAwalUrl,
            loaUploadedAt: now,
            jumlahTerunggah: progress.jumlahTerunggah,
            progresPersen: progress.progresPersen,
          },
        });
      }
    }

    return pendataan.id;
  });

  const fullRow = await prisma.pendataanMagang.findUniqueOrThrow({
    where: { id: savedId },
    include: pendataanDetailInclude,
  });

  return mapPendataanDetailDto(fullRow, { onlyApprovedSk: true });
}

export async function listRekapPendataansForVerifikasi(
  query: ParsedRekapPendataansQuery,
): Promise<RekapPendataansListResponseDto> {
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

  const where: Prisma.PendataanMagangWhereInput = {
    semesterId: semester.id,
    statusPendataan: query.status ?? { not: StatusPendataan.DRAF },
    ...(query.jenisProgram ? { jenisProgram: query.jenisProgram } : {}),
    ...(query.q
      ? {
          OR: [
            { namaInstansi: { contains: query.q } },
            { posisi: { contains: query.q } },
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

  const skip = (query.page - 1) * query.limit;

  const [
    rows,
    totalItems,
    menungguVerifikasi,
    verifiedWithBerkas,
    skBelumDisahkan,
  ] = await Promise.all([
    prisma.pendataanMagang.findMany({
      where,
      skip,
      take: query.limit,
      include: {
        mahasiswa: {
          include: {
            user: {
              select: { nama: true },
            },
          },
        },
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
          select: { sksKonversi: true },
        },
        berkasAkhir: {
          select: { progresPersen: true },
        },
        dokumenSks: {
          orderBy: { tanggalDibuat: "asc" },
        },
      },
      orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.pendataanMagang.count({ where }),
    prisma.pendataanMagang.count({
      where: {
        semesterId: semester.id,
        statusPendataan: StatusPendataan.MENUNGGU,
      },
    }),
    prisma.pendataanMagang.findMany({
      where: {
        semesterId: semester.id,
        statusPendataan: StatusPendataan.TERVERIFIKASI,
      },
      select: {
        berkasAkhir: {
          select: { progresPersen: true },
        },
      },
    }),
    prisma.dokumenSk.count({
      where: {
        statusPengesahan: StatusPengesahanSk.DRAF_MENUNGGU,
        pendataan: {
          semesterId: semester.id,
        },
      },
    }),
  ]);

  const pendataanAktif = verifiedWithBerkas.length;
  const totalProgresVerified = verifiedWithBerkas.reduce(
    (sum, item) => sum + (item.berkasAkhir?.progresPersen ?? 0),
    0,
  );
  const kelengkapanBerkasPersen =
    pendataanAktif > 0
      ? Math.round(
          ((totalProgresVerified / pendataanAktif) + Number.EPSILON) * 100,
        ) / 100
      : 0;

  const totalPages = Math.max(1, Math.ceil(totalItems / query.limit));

  return {
    semester: {
      id: semester.id,
      kodeSemester: semester.kodeSemester,
      namaSemester: semester.namaSemester,
      jenisSemester: semester.jenisSemester,
      isAktif: semester.isAktif,
    },
    stats: {
      menungguVerifikasi,
      pendataanAktif,
      skBelumDisahkan,
      kelengkapanBerkasPersen,
    },
    items: rows.map((row) => ({
      id: row.id,
      mahasiswa: {
        id: row.mahasiswa.id,
        nim: row.mahasiswa.nim,
        nama: row.mahasiswa.user.nama,
        angkatan: row.mahasiswa.angkatan,
      },
      namaInstansi: row.namaInstansi,
      posisi: row.posisi,
      jenisProgram: row.jenisProgram,
      kategoriAnalitik: row.kategoriAnalitik,
      modeKegiatan: row.modeKegiatan,
      tanggalMulai: row.tanggalMulai.toISOString().slice(0, 10),
      tanggalSelesai: row.tanggalSelesai.toISOString().slice(0, 10),
      fileLoaAwalUrl: row.fileLoaAwalUrl,
      fileLoaAwalNama: row.fileLoaAwalNama,
      statusPendataan: row.statusPendataan,
      catatanRevisi: row.catatanRevisi,
      dosenPembimbing: row.dosenPembimbing,
      dosenKunjung: row.dosenKunjung,
      totalMkKonversi: row.konversiMks.length,
      totalSksKonversi: row.konversiMks.reduce(
        (sum, mk) => sum + mk.sksKonversi,
        0,
      ),
      progresBerkasPersen: row.berkasAkhir?.progresPersen ?? 0,
      dokumenSks: row.dokumenSks.map((sk) => ({
        id: sk.id,
        nomorSk: sk.nomorSk,
        jenisSk: sk.jenisSk,
        fileSkUrl: `/api/sks/${sk.id}/unduh`,
        statusPengesahan: sk.statusPengesahan,
        tanggalDibuat: sk.tanggalDibuat.toISOString(),
        tanggalDisahkan: sk.tanggalDisahkan
          ? sk.tanggalDisahkan.toISOString()
          : null,
      })),
      submittedAt: row.submittedAt ? row.submittedAt.toISOString() : null,
      verifiedAt: row.verifiedAt ? row.verifiedAt.toISOString() : null,
    })),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
    },
  };
}

export async function getPendataanDetailForManager(
  pendataanId: string,
): Promise<PendataanDetailDto> {
  const row = await prisma.pendataanMagang.findUnique({
    where: { id: pendataanId },
    include: pendataanDetailInclude,
  });

  if (!row) {
    throw new ApiHttpError(404, "Data pendataan magang tidak ditemukan.");
  }

  return mapPendataanDetailDto(row, { onlyApprovedSk: false });
}

export async function decideVerifikasiPendataan(
  context: ApiAuthContext,
  pendataanId: string,
  decision: VerifikasiPendataanDecisionInput,
): Promise<PendataanDetailDto> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.pendataanMagang.findUnique({
      where: { id: pendataanId },
      include: {
        konversiMks: {
          select: {
            id: true,
            statusPenilaian: true,
          },
        },
        dokumenSks: {
          select: {
            id: true,
            statusPengesahan: true,
          },
        },
      },
    });

    if (!existing) {
      throw new ApiHttpError(404, "Data pendataan magang tidak ditemukan.");
    }

    if (existing.statusPendataan === StatusPendataan.DRAF) {
      throw new ApiHttpError(
        400,
        "Pendataan masih berstatus draf dan belum dikirimkan oleh mahasiswa.",
      );
    }

    if (decision.statusPendataan === "PERLU_REVISI") {
      const hasApprovedSk = existing.dokumenSks.some(
        (sk) => sk.statusPengesahan === StatusPengesahanSk.DISAHKAN,
      );
      const hasPublishedGrade = existing.konversiMks.some(
        (km) => km.statusPenilaian === StatusPenilaianKonversi.DIPUBLIKASIKAN,
      );

      if (hasApprovedSk || hasPublishedGrade) {
        throw new ApiHttpError(
          409,
          "Pendataan yang sudah memiliki SK sah atau nilai konversi terpublikasi tidak dapat dikembalikan ke status perlu revisi.",
        );
      }

      await tx.pendataanMagang.update({
        where: { id: pendataanId },
        data: {
          statusPendataan: StatusPendataan.PERLU_REVISI,
          catatanRevisi: decision.catatanRevisi,
          verifiedByUserId: context.user.id,
          verifiedAt: null,
        },
      });
      return;
    }

    const ownedKonversiIds = new Set(existing.konversiMks.map((km) => km.id));
    if (decision.kesesuaianMks && decision.kesesuaianMks.length > 0) {
      for (const item of decision.kesesuaianMks) {
        if (!ownedKonversiIds.has(item.konversiMkId)) {
          throw new ApiHttpError(
            400,
            "Terdapat ID mata kuliah konversi yang bukan milik pengajuan pendataan ini.",
          );
        }
      }

      for (const item of decision.kesesuaianMks) {
        await tx.konversiMataKuliah.update({
          where: { id: item.konversiMkId },
          data: {
            tingkatKesesuaian: item.tingkatKesesuaian,
          },
        });
      }
    }

    await tx.pendataanMagang.update({
      where: { id: pendataanId },
      data: {
        statusPendataan: StatusPendataan.TERVERIFIKASI,
        verifiedByUserId: context.user.id,
        verifiedAt: new Date(),
        catatanRevisi: null,
      },
    });
  });

  return getPendataanDetailForManager(pendataanId);
}
