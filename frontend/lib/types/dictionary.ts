export interface Dataset {
  id: string;
  name: string;
  description: string;
  language: string;
  category: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatasetsResponse {
  datasets: Dataset[];
  total: number;
}

export interface EntryStats {
  total_entries: number;
  pending_count: number;
  completed_count: number;
  completion_percentage: number;
}

export interface UserEntryStats extends EntryStats {
  annotated_by_user: number;
  submitted_count: number;
  remaining_for_user: number;
  user_completion_percentage: number;
}

export interface DatasetStatsResponse {
  dataset: Dataset;
  overall_stats: EntryStats;
  user_stats: UserEntryStats;
}

export interface Annotation {
  id: string;
  corrected_meaning?: string;
  corrected_examples?: string;
  corrected_tags?: string[];
  corrected_word?: string;
  corrected_word_arabizi?: string;
  notes?: string;
  keycloak_sub: string;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  dataset_id: string;
  word: string;
  word_arabizi?: string;
  meaning: string;
  examples: string;
  tags: string[];
  is_user_submitted: boolean;
  created_by_id: string;
  status: string;
  created_at: string;
  annotation?: Annotation;
}

export interface CreateEntryRequest {
  dataset_id: string;
  word: string;
  word_arabizi?: string;
  meaning: string;
  examples?: string;
  tags?: string[];
}

export interface AnnotateRequest {
  confirmed?: boolean;
  corrected_meaning?: string;
  corrected_examples?: string;
  corrected_tags?: string[];
  corrected_word?: string;
  corrected_word_arabizi?: string;
  notes?: string;
}
