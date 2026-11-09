
async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      ...options,
    });
  } catch {
    throw new Error("Can't reach the server. Is it running?");
  }
  if (res.status === 401) throw new Error("Please log in again");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Could not load your progress");
  return data;
}

// → { unlocked: 2, best: { "1": { distance: 520, stars: 3 } } }
export function getProgress() {
  return request("/api/progress");
}

// Save a finished run (level complete or game over)
export function saveResult(levelId, { score, distance, stars, completed }) {
  return request(`/api/progress/${levelId}`, {
    method: "POST",
    body: JSON.stringify({ score, distance, stars, completed }),
  });
}
