import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKeycloak } from "@/context/KeycloakContext";
import {
  fetchTranslationDatasets,
  fetchTranslationDataset,
  fetchTranslationDatasetStats,
  fetchTranslationNextEntry,
  fetchTranslationEntry,
  annotateTranslationEntry,
} from "@/lib/api/translation";
import type { AnnotateRequest } from "@/lib/types/translation";

export const useTranslationDatasets = () => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["translationDatasets"],
    queryFn: () => fetchTranslationDatasets(token!),
    enabled: !!token,
  });
};

export const useTranslationDataset = (id: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["translationDataset", id],
    queryFn: () => fetchTranslationDataset(token!, id),
    enabled: !!token && !!id,
  });
};

export const useTranslationDatasetStats = (id: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["translationDatasetStats", id],
    queryFn: () => fetchTranslationDatasetStats(token!, id),
    enabled: !!token && !!id,
  });
};

export const useTranslationNextEntry = (datasetId: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["translationNextEntry", datasetId],
    queryFn: () => fetchTranslationNextEntry(token!, datasetId),
    enabled: !!token && !!datasetId,
    staleTime: Infinity,
  });
};

export const useTranslationEntry = (id: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["translationEntry", id],
    queryFn: () => fetchTranslationEntry(token!, id),
    enabled: !!token && !!id,
  });
};

export const useAnnotateTranslationEntry = () => {
  const { token } = useKeycloak();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: string;
      data: AnnotateRequest;
    }) => annotateTranslationEntry(token!, entryId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["translationEntry", variables.entryId],
      });
      queryClient.invalidateQueries({ queryKey: ["translationNextEntry"] });
      queryClient.invalidateQueries({ queryKey: ["translationDatasetStats"] });
    },
  });
};
