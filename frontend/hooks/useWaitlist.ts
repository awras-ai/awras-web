import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWaitlistCount, subscribeToWaitlist } from "@/lib/api/waitlist";

/**
 * Hook for managing waitlist count data
 */
export const useWaitlistCount = () => {
  return useQuery({
    queryKey: ["waitlistCount"],
    queryFn: fetchWaitlistCount,
    refetchInterval: 10_000, // refresh every 10 seconds
    staleTime: 20_000,
  });
};

/**
 * Hook for managing waitlist subscription
 */
export const useWaitlistSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscribeToWaitlist,
    onSuccess: () => {
      // Refetch count immediately on success
      queryClient.invalidateQueries({ queryKey: ["waitlistCount"] });
    },
  });
};

/**
 * Main hook that combines waitlist functionality
 */
export const useWaitlist = () => {
  const [email, setEmail] = useState("");
  const { data: count = 0, isLoading: countLoading } = useWaitlistCount();
  const subscription = useWaitlistSubscription();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscription.mutate(email.trim());
  };

  const handleReset = () => {
    setEmail("");
    subscription.reset();
  };

  // Format count nicely
  const formattedCount = count.toLocaleString();

  return {
    // State
    email,
    setEmail,

    // Data
    count: formattedCount,
    countLoading,

    // Subscription state
    subscription,

    // Actions
    handleSubmit,
    handleReset,
  };
};

