import type { NextRequest } from "next/server";
import {
  logbookIdParamSchema,
  validasiLogbookDecisionSchema,
} from "@/features/logbooks/schemas/logbook.schema";
import { validateLogbookByPembimbing } from "@/features/logbooks/services/logbook.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

interface ValidasiLogbookRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  context: ValidasiLogbookRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["DOSEN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = logbookIdParamSchema.parse(await context.params);
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const decision = validasiLogbookDecisionSchema.parse(rawBody);
    const updated = await validateLogbookByPembimbing(
      auth.context,
      id,
      decision,
    );

    const msg =
      updated.statusValidasi === "TERVALIDASI"
        ? "Catatan logbook mahasiswa berhasil divalidasi."
        : "Permintaan revisi logbook berhasil dikirimkan ke mahasiswa.";

    return jsonSuccess(msg, updated);
  } catch (error: unknown) {
    return handleApiError(
      error,
      "Gagal menyimpan keputusan validasi catatan logbook.",
    );
  }
}
