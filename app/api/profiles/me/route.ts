import {
  StatusPendataan,
  StatusPengesahanSk,
  StatusPenilaianKonversi,
  StatusValidasiLogbook,
} from "@prisma/client";
import type { CurrentUserProfileDto } from "@/features/auths/types/auth.type";
import { requireApiSession } from "@/libs/api-auth";
import { prisma } from "@/libs/prisma";
import { handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET() {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const { user, mahasiswa, dosen } = auth.context;

    const [activeSemester, matakuliahsDiampu] = await Promise.all([
      prisma.periodeSemester.findFirst({
        where: { isAktif: true },
        orderBy: { kodeSemester: "desc" },
      }),
      dosen
        ? prisma.mataKuliah.findMany({
            where: {
              dosenPengampuId: dosen.id,
              isKonversiMbkm: true,
            },
            select: {
              id: true,
              kodeMk: true,
              namaMk: true,
              sks: true,
            },
            orderBy: { kodeMk: "asc" },
          })
        : Promise.resolve([]),
    ]);

    const [
      logbookPerluRevisi,
      bimbinganLogbookMenunggu,
      pendataanMenungguVerifikasi,
      skMenungguPengesahan,
      konversiBelumDinilai,
    ] = await Promise.all([
      mahasiswa
        ? prisma.logbook.count({
            where: {
              statusValidasi: StatusValidasiLogbook.PERLU_REVISI,
              pendataan: {
                mahasiswaId: mahasiswa.id,
                ...(activeSemester ? { semesterId: activeSemester.id } : {}),
              },
            },
          })
        : Promise.resolve(0),
      dosen
        ? prisma.logbook.count({
            where: {
              statusValidasi: StatusValidasiLogbook.MENUNGGU_VALIDASI,
              pendataan: {
                dosenPembimbingId: dosen.id,
                ...(activeSemester ? { semesterId: activeSemester.id } : {}),
              },
            },
          })
        : Promise.resolve(0),
      user.role === "ADMIN" || user.role === "KAPRODI"
        ? prisma.pendataanMagang.count({
            where: {
              statusPendataan: StatusPendataan.MENUNGGU,
              ...(activeSemester ? { semesterId: activeSemester.id } : {}),
            },
          })
        : Promise.resolve(0),
      user.role === "KAPRODI"
        ? prisma.dokumenSk.count({
            where: {
              statusPengesahan: StatusPengesahanSk.DRAF_MENUNGGU,
              ...(activeSemester
                ? { pendataan: { semesterId: activeSemester.id } }
                : {}),
            },
          })
        : Promise.resolve(0),
      dosen
        ? prisma.konversiMataKuliah.count({
            where: {
              statusPenilaian: StatusPenilaianKonversi.BELUM_DINILAI,
              matakuliah: { dosenPengampuId: dosen.id },
              pendataan: {
                statusPendataan: StatusPendataan.TERVERIFIKASI,
                ...(activeSemester ? { semesterId: activeSemester.id } : {}),
              },
            },
          })
        : Promise.resolve(0),
    ]);

    const payload: CurrentUserProfileDto = {
      user,
      mahasiswa,
      dosen,
      matakuliahsDiampu,
      activeSemester: activeSemester
        ? {
            id: activeSemester.id,
            kodeSemester: activeSemester.kodeSemester,
            namaSemester: activeSemester.namaSemester,
            jenisSemester: activeSemester.jenisSemester,
            isAktif: activeSemester.isAktif,
            tanggalMulai: activeSemester.tanggalMulai.toISOString(),
            tanggalSelesai: activeSemester.tanggalSelesai.toISOString(),
          }
        : null,
      canSwitchToDosenMode:
        user.role === "KAPRODI" && matakuliahsDiampu.length > 0,
      badges: {
        logbookPerluRevisi,
        bimbinganLogbookMenunggu,
        pendataanMenungguVerifikasi,
        skMenungguPengesahan,
        konversiBelumDinilai,
      },
    };

    return jsonSuccess("Profil sesi pengguna berhasil dimuat.", payload);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat profil sesi pengguna.");
  }
}
