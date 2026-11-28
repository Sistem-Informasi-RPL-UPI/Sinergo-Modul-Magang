import type { NextRequest } from "next/server";
import { masterDosensQuerySchema } from "@/features/masters/schemas/master.schema";
import type { MasterDosensResponseDto } from "@/features/masters/types/master.type";
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

    const query = masterDosensQuerySchema.parse({
      q: request.nextUrl.searchParams.get("q") ?? undefined,
      includeInactive:
        request.nextUrl.searchParams.get("includeInactive") ?? undefined,
    });

    const canViewInactive =
      auth.context.user.role === "ADMIN" || auth.context.user.role === "KAPRODI";
    const onlyActive = !(canViewInactive && query.includeInactive === "1");

    const rows = await prisma.dosen.findMany({
      where: {
        ...(onlyActive ? { statusAktif: true } : {}),
        ...(query.q
          ? {
              OR: [
                { namaBergelar: { contains: query.q } },
                { nip: { contains: query.q } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: { email: true },
        },
        _count: {
          select: { matakuliahsDiampu: true },
        },
      },
      orderBy: { namaBergelar: "asc" },
    });

    const payload: MasterDosensResponseDto = {
      total: rows.length,
      items: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        nip: row.nip,
        namaBergelar: row.namaBergelar,
        email: row.user.email,
        statusAktif: row.statusAktif,
        jumlahMkDiampu: row._count.matakuliahsDiampu,
      })),
    };

    return jsonSuccess("Daftar dosen berhasil dimuat.", payload);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat daftar dosen.");
  }
}
