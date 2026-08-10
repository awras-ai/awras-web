export interface LeaderboardUser {
  name: string;
  picture: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: LeaderboardUser;
  total_count: number;
  is_current_user: boolean;
}
