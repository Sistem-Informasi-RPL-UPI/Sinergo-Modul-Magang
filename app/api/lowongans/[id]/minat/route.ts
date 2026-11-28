import type { NextRequest } from "next/server";
import { lowonganIdParamSchema } from "@/features/lowongans/schemas/lowongan.schema";
import { recordMinatLowongan } from "@/features/lowongans/services/lowongan.server";
import { requireApiSession } from "@/libs/api-auth";
import { handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

interface MinatLowonganRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  _request: NextRequest,
  context: MinatLowonganRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = lowonganIdParamSchema.parse(await context.params);
    const result = await recordMinatLowongan(auth.context, id);

    return jsonSuccess(
      "Minat pendaftaran pada lowongan berhasil dicatat.",
      result,
      201,
    );
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mencatat minat pada lowongan magang.");
  }
}
