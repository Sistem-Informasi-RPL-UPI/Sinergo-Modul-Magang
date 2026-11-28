import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export function jsonSuccess<T>(
  message: string,
  data: T,
  status = 200,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      errors: null,
    },
    { status },
  );
}

export function jsonError(
  message: string,
  status = 400,
  errors: Record<string, string[]> | null = null,
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
      errors,
    },
    { status },
  );
}
