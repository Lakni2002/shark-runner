// userStore: the ONLY place that reads and writes saved users.
// Users are kept in a simple JSON file. If we switch to a real database later,
// only this file changes – the routes stay the same (low coupling).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import fs from "fs/promises";
import path from "path";

const DATA_FILE = path.resolve("data", "users.json");

async function readAll() {
  try {
    const text = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(text);
  } catch {
    return []; // no file yet = no users yet
  }
}

async function writeAll(users) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
}

export async function findUser(username) {
  const users = await readAll();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function createUser(username, passwordHash) {
  const users = await readAll();
  const user = {
    id: Date.now().toString(36),
    username,
    passwordHash, // never the real password
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeAll(users);
  return user;
}
