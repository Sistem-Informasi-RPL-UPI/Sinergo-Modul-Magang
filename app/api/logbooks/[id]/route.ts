import type { NextRequest } from "next/server";
import {
  logbookIdParamSchema,
  updateLogbookSchema,
} from "@/features/logbooks/schemas/logbook.schema";
import {
  deleteMahasiswaLogbook,
  getLogbookDetail,
  updateMahasiswaLogbook,
} from "@/features/logbooks/services/logbook.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

interface LogbookItemRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: LogbookItemRouteContext,
) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = logbookIdParamSchema.parse(await context.params);
    const detail = await getLogbookDetail(auth.context, id);

    return jsonSuccess("Detail catatan logbook berhasil dimuat.", detail);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat detail catatan logbook.");
  }
}

export async function PATCH(
  request: NextRequest,
  context: LogbookItemRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = logbookIdParamSchema.parse(await context.params);
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const parsed = updateLogbookSchema.parse(rawBody);
    const updated = await updateMahasiswaLogbook(auth.context, id, parsed);

    return jsonSuccess(
      "Catatan logbook berhasil diperbarui dan dikirim ulang untuk divalidasi.",
      updated,
    );
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui catatan logbook.");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: LogbookItemRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = logbookIdParamSchema.parse(await context.params);
    await deleteMahasiswaLogbook(auth.context, id);

    return jsonSuccess("Catatan logbook berhasil dihapus.", { deletedId: id });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus catatan logbook.");
  }
}
