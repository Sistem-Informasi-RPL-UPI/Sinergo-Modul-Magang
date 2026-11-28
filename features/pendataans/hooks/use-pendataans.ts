import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "@/features/auths/hooks/use-auth-profile";
import type {
  PendataanOwnQueryInput,
  RekapPendataansQueryInput,
  SavePendataanDraftInput,
  SubmitPendataanInput,
  VerifikasiPendataanDecisionInput,
} from "@/features/pendataans/schemas/pendataan.schema";
import {
  decideVerifikasi,
  getOwnPendataan,
  getRekapPendataanDetail,
  getRekapPendataans,
  savePendataanDraft,
  submitPendataan,
} from "@/features/pendataans/services/pendataan.service";

export const pendataanQueryKeys = {
  all: ["pendataans"] as const,
  own: (params?: PendataanOwnQueryInput) =>
    ["pendataans", "own", params ?? {}] as const,
  rekapList: (params?: RekapPendataansQueryInput) =>
    ["pendataans", "rekap", params ?? {}] as const,
  rekapDetail: (id: string) => ["pendataans", "rekap", "detail", id] as const,
};

export function useOwnPendataanQuery(params?: PendataanOwnQueryInput) {
  return useQuery({
    queryKey: pendataanQueryKeys.own(params),
    queryFn: () => getOwnPendataan(params),
  });
}

export function useSavePendataanDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SavePendataanDraftInput) =>
      savePendataanDraft(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: pendataanQueryKeys.all,
      });
    },
  });
}

export function useSubmitPendataanMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitPendataanInput) => submitPendataan(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pendataanQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}

export function useRekapPendataansQuery(
  params?: RekapPendataansQueryInput,
  enabled = true,
) {
  return useQuery({
    queryKey: pendataanQueryKeys.rekapList(params),
    queryFn: () => getRekapPendataans(params),
    enabled,
  });
}

export function useRekapPendataanDetailQuery(id: string | null) {
  return useQuery({
    queryKey: pendataanQueryKeys.rekapDetail(id ?? ""),
    queryFn: () => getRekapPendataanDetail(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useDecideVerifikasiMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      payload: VerifikasiPendataanDecisionInput;
    }) => decideVerifikasi(input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pendataanQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: pendataanQueryKeys.rekapDetail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}
