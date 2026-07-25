import type { LeaderboardEntry } from "@/lib/types/leaderboard";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const fetchLeaderboard = async (
  limit: number = 50,
  token?: string,
): Promise<LeaderboardEntry[]> => {
  const url = new URL(`${BASE_URL}api/v1/leaderboard`);
  url.searchParams.set("limit", String(limit));

  const headers: Record<string, string> = { accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
};
