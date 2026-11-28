import type { NextRequest } from "next/server";
import { masterMatakuliahsQuerySchema } from "@/features/masters/schemas/master.schema";
import type { MasterMatakuliahsResponseDto } from "@/features/masters/types/master.type";
import { requireApiSession } from "@/libs/api-auth";
import { prisma } from "@/libs/prisma";
import { handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const query = masterMatakuliahsQuerySchema.parse({
      q: request.nextUrl.searchParams.get("q") ?? undefined,
      dosenPengampuId:
        request.nextUrl.searchParams.get("dosenPengampuId") ?? undefined,
      includeRubrik:
        request.nextUrl.searchParams.get("includeRubrik") ?? undefined,
      includeNonKonversi:
        request.nextUrl.searchParams.get("includeNonKonversi") ?? undefined,
    });

    const canViewNonKonversi =
      auth.context.user.role === "ADMIN" || auth.context.user.role === "KAPRODI";
    const onlyKonversi = !(canViewNonKonversi && query.includeNonKonversi === "1");
    const withRubrik = query.includeRubrik !== "0";

    const rows = await prisma.mataKuliah.findMany({
      where: {
        ...(onlyKonversi ? { isKonversiMbkm: true } : {}),
        ...(query.dosenPengampuId
          ? { dosenPengampuId: query.dosenPengampuId }
          : {}),
        ...(query.q
          ? {
              OR: [
                { kodeMk: { contains: query.q } },
                { namaMk: { contains: query.q } },
              ],
            }
          : {}),
      },
      include: {
        dosenPengampu: {
          select: {
            id: true,
            nip: true,
            namaBergelar: true,
          },
        },
        komponenRubrik: withRubrik
          ? {
              orderBy: { urutan: "asc" },
            }
          : false,
      },
      orderBy: { kodeMk: "asc" },
    });

    const payload: MasterMatakuliahsResponseDto = {
      total: rows.length,
      items: rows.map((row) => ({
        id: row.id,
        kodeMk: row.kodeMk,
        namaMk: row.namaMk,
        sks: row.sks,
        isKonversiMbkm: row.isKonversiMbkm,
        dosenPengampu: {
          id: row.dosenPengampu.id,
          nip: row.dosenPengampu.nip,
          namaBergelar: row.dosenPengampu.namaBergelar,
        },
        ...(withRubrik
          ? {
              komponenRubrik: row.komponenRubrik.map((komponen) => ({
                id: komponen.id,
                namaKomponen: komponen.namaKomponen,
                deskripsiKomponen: komponen.deskripsiKomponen,
                bobotPersen: Number(komponen.bobotPersen),
                urutan: komponen.urutan,
              })),
            }
          : {}),
      })),
    };

    return jsonSuccess("Daftar mata kuliah konversi berhasil dimuat.", payload);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat daftar mata kuliah konversi.");
  }
}
