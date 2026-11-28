import type { NextRequest } from "next/server";
import {
  createLowonganSchema,
  lowongansQuerySchema,
} from "@/features/lowongans/schemas/lowongan.schema";
import {
  createLowonganRecord,
  listLowongans,
} from "@/features/lowongans/services/lowongan.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const query = lowongansQuerySchema.parse({
      q: searchParams.get("q") ?? undefined,
      sumber: searchParams.get("sumber") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const data = await listLowongans(auth.context, query);
    return jsonSuccess("Daftar lowongan magang berhasil dimuat.", data);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat daftar lowongan magang.");
  }
}

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

    const parsed = createLowonganSchema.parse(rawBody);
    const created = await createLowonganRecord(auth.context, parsed);

    const successMsg =
      created.statusLowongan === "AKTIF"
        ? "Lowongan magang berhasil dipublikasikan."
        : "Lowongan magang berhasil disimpan sebagai draf.";

    return jsonSuccess(successMsg, created, 201);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menyimpan lowongan magang baru.");
  }
}
