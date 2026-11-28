import type { NextRequest } from "next/server";
import {
  pendataanOwnQuerySchema,
  savePendataanDraftSchema,
  submitPendataanSchema,
} from "@/features/pendataans/schemas/pendataan.schema";
import {
  getOwnMahasiswaPendataan,
  saveOrSubmitMahasiswaPendataan,
} from "@/features/pendataans/services/pendataan.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const query = pendataanOwnQuerySchema.parse({
      semesterId: request.nextUrl.searchParams.get("semesterId") ?? undefined,
    });

    const data = await getOwnMahasiswaPendataan(auth.context, query);
    return jsonSuccess("Data pendataan magang berhasil dimuat.", data);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat data pendataan magang.");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const parsed = savePendataanDraftSchema.parse(rawBody);
    const saved = await saveOrSubmitMahasiswaPendataan(
      auth.context,
      parsed,
      "DRAFT",
    );

    return jsonSuccess("Draf pendataan magang berhasil disimpan.", saved);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menyimpan draf pendataan magang.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const parsed = submitPendataanSchema.parse(rawBody);
    const submitted = await saveOrSubmitMahasiswaPendataan(
      auth.context,
      parsed,
      "SUBMIT",
    );

    return jsonSuccess(
      "Pendataan magang berhasil dikirimkan dan sedang menunggu verifikasi.",
      submitted,
      201,
    );
  } catch (error: unknown) {
    return handleApiError(error, "Gagal mengirimkan pendataan magang.");
  }
}
