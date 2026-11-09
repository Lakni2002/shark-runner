
export async function getLeaderboard({ period, level, search, page }) {
  const query = new URLSearchParams({ period, level: String(level), search, page: String(page) });

  let res;
  try {
    res = await fetch(`/api/leaderboard?${query}`, { credentials: "same-origin" });
  } catch {
    throw new Error("Can't reach the server. Is it running?");
  }
  if (res.status === 401) throw new Error("Please log in again");
  if (!res.ok) throw new Error("Could not load the leaderboard");
  return res.json();
}
