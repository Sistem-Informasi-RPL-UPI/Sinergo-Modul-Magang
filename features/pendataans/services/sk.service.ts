import type {
  GenerateSkInput,
  PlotDosenKunjungInput,
  SksListQueryInput,
} from "@/features/pendataans/schemas/sk.schema";
import type { PendataanDetailDto } from "@/features/pendataans/types/pendataan.type";
import type {
  DokumenSkDetailDto,
  DokumenSksListResponseDto,
  GenerateSkResponseDto,
} from "@/features/pendataans/types/sk.type";
import { apiClient } from "@/libs/axios";
import type { ApiResponse } from "@/types";

export async function plotDosenKunjung(input: {
  pendataanId: string;
  payload: PlotDosenKunjungInput;
}): Promise<PendataanDetailDto> {
  const { data } = await apiClient.patch<ApiResponse<PendataanDetailDto>>(
    `/verifikasis/pendataans/${input.pendataanId}/dosen-kunjung`,
    input.payload,
  );
  return data.data;
}

export async function getDokumenSks(
  params?: SksListQueryInput,
): Promise<DokumenSksListResponseDto> {
  const { data } = await apiClient.get<ApiResponse<DokumenSksListResponseDto>>(
    "/sks",
    { params },
  );
  return data.data;
}

export async function generateDrafSks(
  payload: GenerateSkInput,
): Promise<GenerateSkResponseDto> {
  const { data } = await apiClient.post<ApiResponse<GenerateSkResponseDto>>(
    "/sks/generate",
    payload,
  );
  return data.data;
}

export async function sahkanDokumenSk(
  skId: string,
): Promise<DokumenSkDetailDto> {
  const { data } = await apiClient.patch<ApiResponse<DokumenSkDetailDto>>(
    `/sks/${skId}/sahkan`,
  );
  return data.data;
}
