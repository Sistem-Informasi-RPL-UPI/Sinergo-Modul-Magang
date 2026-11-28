import type { NextRequest } from "next/server";
import { generateSkSchema } from "@/features/pendataans/schemas/sk.schema";
import { generateDrafDokumenSks } from "@/features/pendataans/services/sk.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["ADMIN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const parsed = generateSkSchema.parse(rawBody);
    const result = await generateDrafDokumenSks(auth.context, parsed);

    return jsonSuccess(
      `Berhasil men-generate ${result.generatedCount} draf Surat Keputusan.`,
      result,
      201,
    );
  } catch (error: unknown) {
    return handleApiError(
      error,
      "Gagal menjalankan otomatisasi generasi draf Surat Keputusan.",
    );
  }
}
