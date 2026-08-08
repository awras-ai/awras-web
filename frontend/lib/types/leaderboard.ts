export interface LeaderboardUser {
  name: string;
  picture: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: LeaderboardUser;
  annotation_count: number;
  report_count: number;
  total_count: number;
  is_current_user: boolean;
}
