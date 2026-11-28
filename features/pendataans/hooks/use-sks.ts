import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "@/features/auths/hooks/use-auth-profile";
import { pendataanQueryKeys } from "@/features/pendataans/hooks/use-pendataans";
import type {
  GenerateSkInput,
  PlotDosenKunjungInput,
  SksListQueryInput,
} from "@/features/pendataans/schemas/sk.schema";
import {
  generateDrafSks,
  getDokumenSks,
  plotDosenKunjung,
  sahkanDokumenSk,
} from "@/features/pendataans/services/sk.service";

export const skQueryKeys = {
  all: ["sks"] as const,
  list: (params?: SksListQueryInput) => ["sks", "list", params ?? {}] as const,
};

export function useDokumenSksQuery(params?: SksListQueryInput, enabled = true) {
  return useQuery({
    queryKey: skQueryKeys.list(params),
    queryFn: () => getDokumenSks(params),
    enabled,
  });
}

export function usePlotDosenKunjungMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      pendataanId: string;
      payload: PlotDosenKunjungInput;
    }) => plotDosenKunjung(input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pendataanQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: pendataanQueryKeys.rekapDetail(variables.pendataanId),
        }),
      ]);
    },
  });
}

export function useGenerateDrafSkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateSkInput) => generateDrafSks(payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: skQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: pendataanQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: pendataanQueryKeys.rekapDetail(variables.pendataanId),
        }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}

export function useSahkanDokumenSkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skId: string) => sahkanDokumenSk(skId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: skQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: pendataanQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}
