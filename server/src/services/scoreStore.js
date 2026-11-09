
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.resolve("data", "runs.json");
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

async function writeAll(runs) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(runs, null, 2));
}

// Save one finished run (level complete or game over)
export async function addRun({ userId, username, levelId, score, distance, completed }) {
  const runs = await readAll();
  runs.push({ userId, username, levelId, score, distance, completed, date: new Date().toISOString() });
  await writeAll(runs);
}

// Build one page of the leaderboard.
// period: "all" | "week"   levelId: number | null   search: text   page: 1, 2, 3…
export async function getLeaderboard({ period, levelId, search, page, pageSize, currentUserId }) {
  const since = period === "week" ? Date.now() - WEEK_MS : 0;
  const runs = (await readAll()).filter(
    (r) => Date.parse(r.date) >= since && (levelId === null || r.levelId === levelId)
  );

  // 1. One row per player: their best score, best distance and highest level
  const players = new Map();
  for (const run of runs) {
    const p = players.get(run.userId) || {
      userId: run.userId,
      username: run.username,
      score: -1,
      bestDistance: 0,
      levelReached: 0,
      date: run.date,
    };
    if (run.score > p.score) {
      p.score = run.score;
      p.date = run.date; // date of their best score
    }
    p.bestDistance = Math.max(p.bestDistance, run.distance);
    p.levelReached = Math.max(p.levelReached, run.levelId);
    players.set(run.userId, p);
  }

  // 2. Sort: highest score first; if equal, the longer distance wins
  const ranked = [...players.values()]
    .sort((a, b) => b.score - a.score || b.bestDistance - a.bestDistance)
    .map((p, i) => ({ ...p, rank: i + 1 }));

  // 3. Search by name (after ranking, so players keep their real rank)
  const term = search.trim().toLowerCase();
  const found = term ? ranked.filter((p) => p.username.toLowerCase().includes(term)) : ranked;

  // 4. Cut out the requested page
  const totalPages = Math.max(1, Math.ceil(found.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  // Only send what the page needs (no user ids)
  const toRow = (p) => ({
    rank: p.rank,
    username: p.username,
    score: p.score,
    bestDistance: p.bestDistance,
    levelReached: p.levelReached,
    date: p.date.slice(0, 10), // "2026-11-09"
    isMe: p.userId === currentUserId,
  });

  const me = ranked.find((p) => p.userId === currentUserId);
  return {
    rows: found.slice(start, start + pageSize).map(toRow),
    total: found.length,
    page: safePage,
    totalPages,
    me: me ? toRow(me) : null, // the logged-in player's own rank, even if not on this page
  };
}
