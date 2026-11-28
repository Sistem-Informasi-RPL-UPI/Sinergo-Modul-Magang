import type { NextRequest } from "next/server";
import { pendataanIdParamSchema } from "@/features/pendataans/schemas/pendataan.schema";
import { plotDosenKunjungSchema } from "@/features/pendataans/schemas/sk.schema";
import { plotDosenKunjungForPendataan } from "@/features/pendataans/services/sk.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

interface DosenKunjungRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: DosenKunjungRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["ADMIN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = pendataanIdParamSchema.parse(await context.params);
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const parsed = plotDosenKunjungSchema.parse(rawBody);
    const updated = await plotDosenKunjungForPendataan(id, parsed);

    const msg = updated.dosenKunjung
      ? "Pembimbing Lapangan (Dosen Kunjung) berhasil ditetapkan."
      : "Penugasan Pembimbing Lapangan (Dosen Kunjung) berhasil dikosongkan.";

    return jsonSuccess(msg, updated);
  } catch (error: unknown) {
    return handleApiError(
      error,
      "Gagal memperbarui Pembimbing Lapangan (Dosen Kunjung).",
    );
  }
}
