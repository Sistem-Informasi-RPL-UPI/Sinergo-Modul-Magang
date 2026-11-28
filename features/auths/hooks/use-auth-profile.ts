import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/features/auths/services/auth.service";

export const authQueryKeys = {
  profileMe: ["profiles", "me"] as const,
};

export function useCurrentUserProfileQuery(enabled = true) {
  return useQuery({
    queryKey: authQueryKeys.profileMe,
    queryFn: getCurrentUserProfile,
    enabled,
  });
}
