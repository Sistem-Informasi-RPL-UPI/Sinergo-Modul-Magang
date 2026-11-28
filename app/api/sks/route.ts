import type { NextRequest } from "next/server";
import { sksListQuerySchema } from "@/features/pendataans/schemas/sk.schema";
import { listDokumenSks } from "@/features/pendataans/services/sk.server";
import { requireApiSession } from "@/libs/api-auth";
import { handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const sp = request.nextUrl.searchParams;
    const query = sksListQuerySchema.parse({
      semesterId: sp.get("semesterId") ?? undefined,
      pendataanId: sp.get("pendataanId") ?? undefined,
      jenisSk: sp.get("jenisSk") ?? undefined,
      statusPengesahan: sp.get("statusPengesahan") ?? undefined,
      q: sp.get("q") ?? undefined,
      page: sp.get("page") ?? undefined,
      limit: sp.get("limit") ?? undefined,
    });

    const data = await listDokumenSks(auth.context, query);
    return jsonSuccess("Daftar dokumen Surat Keputusan berhasil dimuat.", data);
  } catch (error: unknown) {
    return handleApiError(
      error,
      "Gagal memuat daftar dokumen Surat Keputusan.",
    );
  }
}
