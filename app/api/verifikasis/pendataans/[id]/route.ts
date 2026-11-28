import type { NextRequest } from "next/server";
import {
  pendataanIdParamSchema,
  verifikasiPendataanDecisionSchema,
} from "@/features/pendataans/schemas/pendataan.schema";
import {
  decideVerifikasiPendataan,
  getPendataanDetailForManager,
} from "@/features/pendataans/services/pendataan.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

interface VerifikasiPendataanRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: VerifikasiPendataanRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["ADMIN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = pendataanIdParamSchema.parse(await context.params);
    const detail = await getPendataanDetailForManager(id);

    return jsonSuccess("Detail pengajuan pendataan berhasil dimuat.", detail);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat detail pengajuan pendataan.");
  }
}

export async function PATCH(
  request: NextRequest,
  context: VerifikasiPendataanRouteContext,
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

    const decision = verifikasiPendataanDecisionSchema.parse(rawBody);
    const updated = await decideVerifikasiPendataan(auth.context, id, decision);

    const msg =
      updated.statusPendataan === "TERVERIFIKASI"
        ? "Pengajuan pendataan mahasiswa berhasil diverifikasi."
        : "Permintaan revisi pendataan berhasil dikirimkan ke mahasiswa.";

    return jsonSuccess(msg, updated);
  } catch (error: unknown) {
    return handleApiError(
      error,
      "Gagal menyimpan keputusan verifikasi pendataan.",
    );
  }
}
