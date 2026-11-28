import type {
  CreateLogbookInput,
  LogbooksQueryInput,
  UpdateLogbookInput,
  ValidasiLogbookDecisionInput,
} from "@/features/logbooks/schemas/logbook.schema";
import type {
  LogbookItemDto,
  LogbooksListResponseDto,
} from "@/features/logbooks/types/logbook.type";
import { apiClient } from "@/libs/axios";
import type { ApiResponse } from "@/types";

export async function getLogbooks(
  params?: LogbooksQueryInput,
): Promise<LogbooksListResponseDto> {
  const { data } = await apiClient.get<ApiResponse<LogbooksListResponseDto>>(
    "/logbooks",
    { params },
  );
  return data.data;
}

export async function getLogbookById(id: string): Promise<LogbookItemDto> {
  const { data } = await apiClient.get<ApiResponse<LogbookItemDto>>(
    `/logbooks/${id}`,
  );
  return data.data;
}

export async function createLogbook(
  payload: CreateLogbookInput,
): Promise<LogbookItemDto> {
  const { data } = await apiClient.post<ApiResponse<LogbookItemDto>>(
    "/logbooks",
    payload,
  );
  return data.data;
}

export async function updateLogbook(input: {
  id: string;
  payload: UpdateLogbookInput;
}): Promise<LogbookItemDto> {
  const { data } = await apiClient.patch<ApiResponse<LogbookItemDto>>(
    `/logbooks/${input.id}`,
    input.payload,
  );
  return data.data;
}

export async function deleteLogbook(
  id: string,
): Promise<{ deletedId: string }> {
  const { data } = await apiClient.delete<ApiResponse<{ deletedId: string }>>(
    `/logbooks/${id}`,
  );
  return data.data;
}

export async function validateLogbook(input: {
  id: string;
  payload: ValidasiLogbookDecisionInput;
}): Promise<LogbookItemDto> {
  const { data } = await apiClient.patch<ApiResponse<LogbookItemDto>>(
    `/logbooks/${input.id}/validasi`,
    input.payload,
  );
  return data.data;
}
