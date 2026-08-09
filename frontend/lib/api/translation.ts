import type {
  Dataset,
  DatasetsResponse,
  DatasetStatsResponse,
  Entry,
  AnnotateRequest,
  Annotation,
} from "@/lib/types/translation";
import { NoEntriesAvailableError } from "@/lib/api/dictionary";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const fetchTranslationDatasets = async (
  token: string,
): Promise<DatasetsResponse> => {
  const res = await fetch(`${BASE_URL}api/v1/translation/datasets`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch translation datasets");
  return res.json();
};

export const fetchTranslationDataset = async (
  token: string,
  id: string,
): Promise<Dataset> => {
  const res = await fetch(
    `${BASE_URL}api/v1/translation/datasets/${id}`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch translation dataset");
  return res.json();
};

export const fetchTranslationDatasetStats = async (
  token: string,
  id: string,
): Promise<DatasetStatsResponse> => {
  const res = await fetch(
    `${BASE_URL}api/v1/translation/datasets/${id}/stats`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch translation dataset stats");
  return res.json();
};

export const fetchTranslationNextEntry = async (
  token: string,
  datasetId: string,
): Promise<Entry> => {
  const url = new URL(`${BASE_URL}api/v1/translation/entries/next`);
  url.searchParams.set("dataset_id", datasetId);

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) throw new NoEntriesAvailableError();
  if (!res.ok) throw new Error("Failed to fetch next translation entry");
  return res.json();
};

export const fetchTranslationEntry = async (
  token: string,
  id: string,
): Promise<Entry> => {
  const res = await fetch(`${BASE_URL}api/v1/translation/entries/${id}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch translation entry");
  return res.json();
};

export const annotateTranslationEntry = async (
  token: string,
  entryId: string,
  data: AnnotateRequest,
): Promise<Annotation> => {
  const res = await fetch(
    `${BASE_URL}api/v1/translation/entries/${entryId}/annotate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) throw new Error("Failed to annotate translation entry");
  return res.json();
};
