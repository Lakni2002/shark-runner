// puzzleService: the ONLY place in the frontend that asks the server for Fish API puzzles.
// The browser never calls the Fish API itself and never sees the answer before answering.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.

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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "The server is not responding.");
  return data;
}

// → { image, timeLimit }
export function getPuzzle() {
  return request("/api/puzzle");
}

// → { correct, timedOut, answer: { fish, chests } }
export function checkAnswer(fish, chests) {
  return request("/api/puzzle/answer", {
    method: "POST",
    body: JSON.stringify({ fish, chests }),
  });
}
