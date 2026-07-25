import { useQuery } from "@tanstack/react-query";
import { useKeycloak } from "@/context/KeycloakContext";
import { fetchLeaderboard } from "@/lib/api/leaderboard";

export const useLeaderboard = (limit: number = 50) => {
  const { token } = useKeycloak();

  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => fetchLeaderboard(limit, token ?? undefined),
    staleTime: 30_000,
  });
};
