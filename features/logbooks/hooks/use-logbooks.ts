import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "@/features/auths/hooks/use-auth-profile";
import type {
  CreateLogbookInput,
  LogbooksQueryInput,
  UpdateLogbookInput,
  ValidasiLogbookDecisionInput,
} from "@/features/logbooks/schemas/logbook.schema";
import {
  createLogbook,
  deleteLogbook,
  getLogbookById,
  getLogbooks,
  updateLogbook,
  validateLogbook,
} from "@/features/logbooks/services/logbook.service";

export const logbookQueryKeys = {
  all: ["logbooks"] as const,
  list: (params?: LogbooksQueryInput) =>
    ["logbooks", "list", params ?? {}] as const,
  detail: (id: string) => ["logbooks", "detail", id] as const,
};

export function useLogbooksQuery(params?: LogbooksQueryInput, enabled = true) {
  return useQuery({
    queryKey: logbookQueryKeys.list(params),
    queryFn: () => getLogbooks(params),
    enabled,
  });
}

export function useLogbookDetailQuery(id: string | null) {
  return useQuery({
    queryKey: logbookQueryKeys.detail(id ?? ""),
    queryFn: () => getLogbookById(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateLogbookMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLogbookInput) => createLogbook(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: logbookQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}

export function useUpdateLogbookMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; payload: UpdateLogbookInput }) =>
      updateLogbook(input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: logbookQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: logbookQueryKeys.detail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}

export function useDeleteLogbookMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLogbook(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: logbookQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}

export function useValidateLogbookMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: string;
      payload: ValidasiLogbookDecisionInput;
    }) => validateLogbook(input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: logbookQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: logbookQueryKeys.detail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: authQueryKeys.profileMe }),
      ]);
    },
  });
}
