// progressStore: the ONLY place that reads and writes each player's level progress.
// Saved in a JSON file for now (easy to swap for SQLite later without touching the routes).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.resolve("data", "progress.json");

// A brand-new player has only level 1 unlocked and no best results yet
const NEW_PLAYER = { unlocked: 1, best: {} };

async function readAll() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch {
    return {}; // { "<userId>": { unlocked, best } }
  }
}

async function writeAll(all) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2));
}

export async function getProgress(userId) {
  const all = await readAll();
  return all[userId] || { ...NEW_PLAYER, best: {} };
}

// Save a finished run: keep the best distance/stars, and unlock the next level if completed
export async function saveLevelResult(userId, levelId, { distance, stars, completed }) {
  const all = await readAll();
  const progress = all[userId] || { ...NEW_PLAYER, best: {} };

  const old = progress.best[levelId] || { distance: 0, stars: 0 };
  progress.best[levelId] = {
    distance: Math.max(old.distance, distance),
    stars: Math.max(old.stars, stars),
  };
  if (completed && levelId >= progress.unlocked) {
    progress.unlocked = levelId + 1;
  }

  all[userId] = progress;
  await writeAll(all);
  return progress;
}
