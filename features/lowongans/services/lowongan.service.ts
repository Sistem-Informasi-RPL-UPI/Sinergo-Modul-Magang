import type {
  AnalitikMbkmQueryInput,
  CreateLowonganInput,
  LowongansQueryInput,
  UpdateLowonganInput,
} from "@/features/lowongans/schemas/lowongan.schema";
import type {
  AnalitikMbkmResponseDto,
  CatatMinatResponseDto,
  LowonganDetailDto,
  LowongansListResponseDto,
} from "@/features/lowongans/types/lowongan.type";
import { apiClient } from "@/libs/axios";
import type { ApiResponse } from "@/types";

export async function getLowongans(
  params?: LowongansQueryInput,
): Promise<LowongansListResponseDto> {
  const { data } = await apiClient.get<ApiResponse<LowongansListResponseDto>>(
    "/lowongans",
    { params },
  );
  return data.data;
}

export async function getLowonganById(id: string): Promise<LowonganDetailDto> {
  const { data } = await apiClient.get<ApiResponse<LowonganDetailDto>>(
    `/lowongans/${id}`,
  );
  return data.data;
}

export async function createLowongan(
  payload: CreateLowonganInput,
): Promise<LowonganDetailDto> {
  const { data } = await apiClient.post<ApiResponse<LowonganDetailDto>>(
    "/lowongans",
    payload,
  );
  return data.data;
}

export async function updateLowongan(input: {
  id: string;
  payload: UpdateLowonganInput;
}): Promise<LowonganDetailDto> {
  const { data } = await apiClient.patch<ApiResponse<LowonganDetailDto>>(
    `/lowongans/${input.id}`,
    input.payload,
  );
  return data.data;
}

export async function deleteLowongan(
  id: string,
): Promise<{ deletedId: string }> {
  const { data } = await apiClient.delete<ApiResponse<{ deletedId: string }>>(
    `/lowongans/${id}`,
  );
  return data.data;
}

export async function catatMinatLowongan(
  id: string,
): Promise<CatatMinatResponseDto> {
  const { data } = await apiClient.post<ApiResponse<CatatMinatResponseDto>>(
    `/lowongans/${id}/minat`,
  );
  return data.data;
}

export async function getAnalitikMbkm(
  params?: AnalitikMbkmQueryInput,
): Promise<AnalitikMbkmResponseDto> {
  const { data } = await apiClient.get<ApiResponse<AnalitikMbkmResponseDto>>(
    "/kaprodi/analitik-mbkm",
    { params },
  );
  return data.data;
}
