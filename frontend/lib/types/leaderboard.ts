export interface LeaderboardUser {
  sub: string;
  name: string;
  username: string;
  email: string | null;
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
