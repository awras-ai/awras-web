import type {
  Dataset,
  DatasetsResponse,
  DatasetStatsResponse,
  Entry,
  CreateEntryRequest,
  Annotation,
  AnnotateRequest,
  Report,
  ReportRequest,
} from "@/lib/types/dictionary";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const fetchDatasets = async (token: string): Promise<DatasetsResponse> => {
  const res = await fetch(`${BASE_URL}api/v1/dictionary/datasets`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch datasets");
  return res.json();
};

export const fetchDataset = async (
  token: string,
  id: string,
): Promise<Dataset> => {
  const res = await fetch(`${BASE_URL}api/v1/dictionary/datasets/${id}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch dataset");
  return res.json();
};

export const fetchDatasetStats = async (
  token: string,
  id: string,
): Promise<DatasetStatsResponse> => {
  const res = await fetch(
    `${BASE_URL}api/v1/dictionary/datasets/${id}/stats`,
    {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch dataset stats");
  return res.json();
};

export class NoEntriesAvailableError extends Error {
  constructor() {
    super("NO_ENTRIES_AVAILABLE");
    this.name = "NoEntriesAvailableError";
  }
}

export const fetchNextEntry = async (
  token: string,
  datasetId: string,
): Promise<Entry> => {
  const url = new URL(`${BASE_URL}api/v1/dictionary/entries/next`);
  url.searchParams.set("dataset_id", datasetId);

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 404) throw new NoEntriesAvailableError();
  if (!res.ok) throw new Error("Failed to fetch next entry");
  return res.json();
};

export const fetchEntry = async (
  token: string,
  id: string,
): Promise<Entry> => {
  const res = await fetch(`${BASE_URL}api/v1/dictionary/entries/${id}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch entry");
  return res.json();
};

export const createEntry = async (
  token: string,
  data: CreateEntryRequest,
): Promise<Entry> => {
  const res = await fetch(`${BASE_URL}api/v1/dictionary/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to create entry");
  return res.json();
};

export const annotateEntry = async (
  token: string,
  entryId: string,
  data: AnnotateRequest,
): Promise<Annotation> => {
  const res = await fetch(
    `${BASE_URL}api/v1/dictionary/entries/${entryId}/annotate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) throw new Error("Failed to annotate entry");
  return res.json();
};

export class ReportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportError";
  }
}

export const reportEntry = async (
  token: string,
  entryId: string,
  data: ReportRequest,
): Promise<Report> => {
  const res = await fetch(
    `${BASE_URL}api/v1/dictionary/entries/${entryId}/report`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    let detail = "Failed to report entry";
    try {
      const body = await res.json();
      if (typeof body?.detail === "string" && body.detail.length > 0) {
        detail = body.detail;
      }
    } catch {
      // response body wasn't JSON; keep default
    }
    throw new ReportError(detail);
  }
  return res.json();
};
