import type {
  PendataanOwnQueryInput,
  RekapPendataansQueryInput,
  SavePendataanDraftInput,
  SubmitPendataanInput,
  VerifikasiPendataanDecisionInput,
} from "@/features/pendataans/schemas/pendataan.schema";
import type {
  MahasiswaPendataanOwnResponseDto,
  PendataanDetailDto,
  RekapPendataansListResponseDto,
} from "@/features/pendataans/types/pendataan.type";
import { apiClient } from "@/libs/axios";
import type { ApiResponse } from "@/types";

export async function getOwnPendataan(
  params?: PendataanOwnQueryInput,
): Promise<MahasiswaPendataanOwnResponseDto> {
  const { data } = await apiClient.get<
    ApiResponse<MahasiswaPendataanOwnResponseDto>
  >("/pendataans", { params });
  return data.data;
}

export async function savePendataanDraft(
  payload: SavePendataanDraftInput,
): Promise<PendataanDetailDto> {
  const { data } = await apiClient.put<ApiResponse<PendataanDetailDto>>(
    "/pendataans",
    payload,
  );
  return data.data;
}

export async function submitPendataan(
  payload: SubmitPendataanInput,
): Promise<PendataanDetailDto> {
  const { data } = await apiClient.post<ApiResponse<PendataanDetailDto>>(
    "/pendataans",
    payload,
  );
  return data.data;
}

export async function getRekapPendataans(
  params?: RekapPendataansQueryInput,
): Promise<RekapPendataansListResponseDto> {
  const { data } = await apiClient.get<
    ApiResponse<RekapPendataansListResponseDto>
  >("/verifikasis/pendataans", { params });
  return data.data;
}

export async function getRekapPendataanDetail(
  id: string,
): Promise<PendataanDetailDto> {
  const { data } = await apiClient.get<ApiResponse<PendataanDetailDto>>(
    `/verifikasis/pendataans/${id}`,
  );
  return data.data;
}

export async function decideVerifikasi(input: {
  id: string;
  payload: VerifikasiPendataanDecisionInput;
}): Promise<PendataanDetailDto> {
  const { data } = await apiClient.patch<ApiResponse<PendataanDetailDto>>(
    `/verifikasis/pendataans/${input.id}`,
    input.payload,
  );
  return data.data;
}
