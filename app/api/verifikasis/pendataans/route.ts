import type { NextRequest } from "next/server";
import { rekapPendataansQuerySchema } from "@/features/pendataans/schemas/pendataan.schema";
import { listRekapPendataansForVerifikasi } from "@/features/pendataans/services/pendataan.server";
import { requireApiSession } from "@/libs/api-auth";
import { handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["ADMIN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const sp = request.nextUrl.searchParams;
    const query = rekapPendataansQuerySchema.parse({
      semesterId: sp.get("semesterId") ?? undefined,
      status: sp.get("status") ?? undefined,
      jenisProgram: sp.get("jenisProgram") ?? undefined,
      q: sp.get("q") ?? undefined,
      page: sp.get("page") ?? undefined,
      limit: sp.get("limit") ?? undefined,
    });

    const data = await listRekapPendataansForVerifikasi(query);
    return jsonSuccess("Rekap pendataan mahasiswa berhasil dimuat.", data);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat rekap pendataan mahasiswa.");
  }
}
