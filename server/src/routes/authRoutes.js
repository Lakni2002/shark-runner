// Auth routes: register, login, logout, and "who am I?".
// Passwords are hashed with bcrypt; the logged-in user is remembered in a server session.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { Router } from "express";
import bcrypt from "bcryptjs";
import { findUser, createUser } from "../services/userStore.js";

const router = Router();
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Check what the user typed (the browser checks too, but the server must never trust the browser)
function validate(username, password) {
  if (typeof username !== "string" || !/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return "Username must be 3–20 letters, numbers or _";
  }
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}

// Save who is logged in into the session
function startSession(req, user, remember) {
  req.session.user = { id: user.id, username: user.username };
  // Remember me = cookie lasts 30 days; otherwise it ends when the browser closes
  req.session.cookie.maxAge = remember ? THIRTY_DAYS : null;
}

// POST /api/auth/register  { username, password }
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const problem = validate(username, password);
  if (problem) return res.status(400).json({ error: problem });

  if (await findUser(username)) {
    return res.status(409).json({ error: "That username is already taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10); // 10 = how hard the hash is to crack
  const user = await createUser(username, passwordHash);
  startSession(req, user, false);
  res.status(201).json({ user: req.session.user });
});

// POST /api/auth/login  { username, password, remember }
router.post("/login", async (req, res) => {
  const { username, password, remember } = req.body;
  const user = typeof username === "string" ? await findUser(username) : null;

  // Same message for "no such user" and "wrong password", so attackers can't guess usernames
  const ok = user && typeof password === "string" && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: "Wrong username or password" });

  // New session id after login (prevents "session fixation" attacks)
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: "Could not start session" });
    startSession(req, user, Boolean(remember));
    res.json({ user: req.session.user });
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

// GET /api/auth/me  → who is logged in right now (or null)
router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

export default router;
