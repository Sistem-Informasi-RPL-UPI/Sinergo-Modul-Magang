import type { CurrentUserProfileDto } from "@/features/auths/types/auth.type";
import { apiClient } from "@/libs/axios";
import type { ApiResponse } from "@/types";

export async function getCurrentUserProfile(): Promise<CurrentUserProfileDto> {
  const { data } =
    await apiClient.get<ApiResponse<CurrentUserProfileDto>>("/profiles/me");
  return data.data;
}
