import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKeycloak } from "@/context/KeycloakContext";
import {
  fetchDatasets,
  fetchDataset,
  fetchDatasetStats,
  fetchNextEntry,
  fetchEntry,
  createEntry,
  annotateEntry,
} from "@/lib/api/dictionary";
import type { CreateEntryRequest, AnnotateRequest } from "@/lib/types/dictionary";

export const useDatasets = () => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["datasets"],
    queryFn: () => fetchDatasets(token!),
    enabled: !!token,
  });
};

export const useDataset = (id: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["dataset", id],
    queryFn: () => fetchDataset(token!, id),
    enabled: !!token && !!id,
  });
};

export const useDatasetStats = (id: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["datasetStats", id],
    queryFn: () => fetchDatasetStats(token!, id),
    enabled: !!token && !!id,
  });
};

export const useNextEntry = (datasetId: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["nextEntry", datasetId],
    queryFn: () => fetchNextEntry(token!, datasetId),
    enabled: !!token && !!datasetId,
  });
};

export const useEntry = (id: string) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["entry", id],
    queryFn: () => fetchEntry(token!, id),
    enabled: !!token && !!id,
  });
};

export const useCreateEntry = () => {
  const { token } = useKeycloak();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntryRequest) => createEntry(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      queryClient.invalidateQueries({ queryKey: ["datasetStats"] });
    },
  });
};

export const useAnnotateEntry = () => {
  const { token } = useKeycloak();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: string;
      data: AnnotateRequest;
    }) => annotateEntry(token!, entryId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entry", variables.entryId] });
      queryClient.invalidateQueries({ queryKey: ["nextEntry"] });
      queryClient.invalidateQueries({ queryKey: ["datasetStats"] });
    },
  });
};
