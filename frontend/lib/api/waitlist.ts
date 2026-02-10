// API service layer for waitlist operations

/**
 * Fetch the current waitlist count
 */
export const fetchWaitlistCount = async (): Promise<number> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}api/v1/waitlist/count`,
    {
      headers: { accept: "application/json" },
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to fetch count");
  const data = await res.json();
  return data.count;
};

/**
 * Subscribe an email to the waitlist
 */
export const subscribeToWaitlist = async (email: string): Promise<unknown> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}api/v1/waitlist/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "waitlist" }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 409)
      throw new Error("You're already on the waitlist!");
    if (res.status === 429)
      throw new Error("Too many requests — try again in a minute.");
    if (res.status === 422) throw new Error("Please enter a valid email.");
    throw new Error(err || "Failed to join waitlist");
  }
  return res.json();
};