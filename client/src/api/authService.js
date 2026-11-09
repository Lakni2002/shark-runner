// authService: the ONLY place in the frontend that talks to the server about accounts.
// Pages call these functions; they never use fetch() directly (low coupling).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.

// Send JSON to the server and return the JSON reply (or throw an Error with the server's message)
async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin", // send the session cookie
      ...options,
    });
  } catch {
    throw new Error("Can't reach the server. Is it running?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export async function register(username, password) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return data.user;
}

export async function login(username, password, remember) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, remember }),
  });
  return data.user;
}

export async function logout() {
  await request("/api/auth/logout", { method: "POST" });
}

// Who is logged in? (null if nobody) – used when the page loads
export async function getCurrentUser() {
  try {
    const data = await request("/api/auth/me");
    return data.user;
  } catch {
    return null;
  }
}
