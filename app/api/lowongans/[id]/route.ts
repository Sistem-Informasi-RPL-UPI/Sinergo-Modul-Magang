import type { NextRequest } from "next/server";
import {
  lowonganIdParamSchema,
  updateLowonganSchema,
} from "@/features/lowongans/schemas/lowongan.schema";
import {
  deleteLowonganRecord,
  getLowonganDetail,
  updateLowonganRecord,
} from "@/features/lowongans/services/lowongan.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

interface LowonganRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: LowonganRouteContext,
) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = lowonganIdParamSchema.parse(await context.params);
    const detail = await getLowonganDetail(auth.context, id);

    return jsonSuccess("Detail lowongan magang berhasil dimuat.", detail);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat detail lowongan magang.");
  }
}

export async function PATCH(
  request: NextRequest,
  context: LowonganRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["ADMIN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = lowonganIdParamSchema.parse(await context.params);
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const parsed = updateLowonganSchema.parse(rawBody);
    const updated = await updateLowonganRecord(auth.context, id, parsed);

    return jsonSuccess("Data lowongan magang berhasil diperbarui.", updated);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memperbarui data lowongan magang.");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: LowonganRouteContext,
) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["ADMIN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = lowonganIdParamSchema.parse(await context.params);
    await deleteLowonganRecord(id);

    return jsonSuccess("Lowongan magang berhasil dihapus.", { deletedId: id });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menghapus lowongan magang.");
  }
}
