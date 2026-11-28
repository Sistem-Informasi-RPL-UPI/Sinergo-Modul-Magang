import type { NextRequest } from "next/server";
import { analitikMbkmQuerySchema } from "@/features/lowongans/schemas/lowongan.schema";
import { getAnalitikMbkmKaprodi } from "@/features/lowongans/services/lowongan.server";
import { requireApiSession } from "@/libs/api-auth";
import { handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const query = analitikMbkmQuerySchema.parse({
      semesterId: request.nextUrl.searchParams.get("semesterId") ?? undefined,
    });

    const data = await getAnalitikMbkmKaprodi(query);
    return jsonSuccess(
      "Data analitik aktivitas MBKM per angkatan berhasil dimuat.",
      data,
    );
  } catch (error: unknown) {
    return handleApiError(
      error,
      "Gagal memuat data analitik aktivitas MBKM per angkatan.",
    );
  }
}
