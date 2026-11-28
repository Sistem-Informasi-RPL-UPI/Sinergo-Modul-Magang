import type { NextRequest } from "next/server";
import { skIdParamSchema } from "@/features/pendataans/schemas/sk.schema";
import { sahkanDokumenSkByKaprodi } from "@/features/pendataans/services/sk.server";
import { requireApiSession } from "@/libs/api-auth";
import { handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

interface SahkanSkRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  _request: NextRequest,
  context: SahkanSkRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = skIdParamSchema.parse(await context.params);
    const approved = await sahkanDokumenSkByKaprodi(auth.context, id);

    return jsonSuccess(
      "Surat Keputusan berhasil disahkan secara resmi oleh Ketua Program Studi.",
      approved,
    );
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengesahkan dokumen Surat Keputusan.");
  }
}
