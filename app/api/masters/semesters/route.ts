import type { NextRequest } from "next/server";
import { masterSemestersQuerySchema } from "@/features/masters/schemas/master.schema";
import type { MasterSemestersResponseDto } from "@/features/masters/types/master.type";
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

    const query = masterSemestersQuerySchema.parse({
      aktifOnly: request.nextUrl.searchParams.get("aktifOnly") ?? undefined,
    });

    const rows = await prisma.periodeSemester.findMany({
      where: query.aktifOnly === "1" ? { isAktif: true } : undefined,
      orderBy: { kodeSemester: "desc" },
    });

    const activeRow = rows.find((item) => item.isAktif) ?? null;

    const payload: MasterSemestersResponseDto = {
      activeSemesterId: activeRow?.id ?? null,
      items: rows.map((row) => ({
        id: row.id,
        kodeSemester: row.kodeSemester,
        namaSemester: row.namaSemester,
        jenisSemester: row.jenisSemester,
        isAktif: row.isAktif,
        tanggalMulai: row.tanggalMulai.toISOString(),
        tanggalSelesai: row.tanggalSelesai.toISOString(),
      })),
    };

    return jsonSuccess("Daftar periode semester berhasil dimuat.", payload);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat daftar periode semester.");
  }
}
