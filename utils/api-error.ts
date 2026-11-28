import { Prisma } from "@prisma/client";
import type { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiResponse } from "@/types";
import { jsonError } from "@/utils/api-response";

export class ApiHttpError extends Error {
  public readonly status: number;
  public readonly errors: Record<string, string[]> | null;

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.errors = errors;
  }
}

export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    const bucket = fieldErrors[key] ?? [];
    bucket.push(issue.message);
    fieldErrors[key] = bucket;
  }

  return fieldErrors;
}

export function handleApiError(
  error: unknown,
  fallbackMessage = "Terjadi kesalahan internal pada peladen.",
): NextResponse<ApiResponse<null>> {
  if (error instanceof ApiHttpError) {
    return jsonError(error.message, error.status, error.errors);
  }

  if (error instanceof ZodError) {
    return jsonError(
      "Data masukan tidak memenuhi aturan validasi.",
      400,
      formatZodErrors(error),
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const rawTarget = error.meta?.target;
      const targetLabel = Array.isArray(rawTarget)
        ? rawTarget.join(", ")
        : typeof rawTarget === "string"
          ? rawTarget
          : "unik";

      return jsonError(
        `Data dengan kombinasi ${targetLabel} tersebut sudah terdaftar.`,
        409,
      );
    }

    if (error.code === "P2025") {
      return jsonError("Data yang diminta tidak ditemukan.", 404);
    }

    if (error.code === "P2003") {
      return jsonError(
        "Operasi ditolak karena data masih terhubung dengan catatan lain.",
        409,
      );
    }
  }

  console.error("[API_UNHANDLED_ERROR]", error instanceof Error ? error.message : "Unknown error");
  return jsonError(fallbackMessage, 500);
}
