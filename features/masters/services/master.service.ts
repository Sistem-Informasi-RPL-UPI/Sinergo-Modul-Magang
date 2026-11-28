import type {
  MasterDosensQueryInput,
  MasterMatakuliahsQueryInput,
  MasterSemestersQueryInput,
} from "@/features/masters/schemas/master.schema";
import type {
  MasterDosensResponseDto,
  MasterMatakuliahsResponseDto,
  MasterSemestersResponseDto,
} from "@/features/masters/types/master.type";
import { apiClient } from "@/libs/axios";
import type { ApiResponse } from "@/types";

export async function getMasterSemesters(
  params?: MasterSemestersQueryInput,
): Promise<MasterSemestersResponseDto> {
  const { data } = await apiClient.get<ApiResponse<MasterSemestersResponseDto>>(
    "/masters/semesters",
    { params },
  );
  return data.data;
}

export async function getMasterDosens(
  params?: MasterDosensQueryInput,
): Promise<MasterDosensResponseDto> {
  const { data } = await apiClient.get<ApiResponse<MasterDosensResponseDto>>(
    "/masters/dosens",
    { params },
  );
  return data.data;
}

export async function getMasterMatakuliahs(
  params?: MasterMatakuliahsQueryInput,
): Promise<MasterMatakuliahsResponseDto> {
  const { data } = await apiClient.get<
    ApiResponse<MasterMatakuliahsResponseDto>
  >("/masters/matakuliahs", { params });
  return data.data;
}
