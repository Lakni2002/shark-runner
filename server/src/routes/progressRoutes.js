// Progress routes: each logged-in player can read and save ONLY their own progress.
// The user id comes from the session on the server – never from the browser – so nobody can
// read or change another player's progress (virtual identity).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import { getProgress, saveLevelResult } from "../services/progressStore.js";

const router = Router();
const LEVEL_COUNT = 4;

// GET /api/progress → { unlocked, best }
router.get("/", requireLogin, async (req, res) => {
  const progress = await getProgress(req.session.user.id);
  res.json(progress);
});

// POST /api/progress/:levelId  { distance, stars, completed } → updated progress
router.post("/:levelId", requireLogin, async (req, res) => {
  const levelId = Number(req.params.levelId);
  const distance = Math.floor(Number(req.body.distance));
  const stars = Math.floor(Number(req.body.stars));
  const completed = req.body.completed === true;

  // Check the data before saving it
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > LEVEL_COUNT) {
    return res.status(400).json({ error: "Unknown level" });
  }
  if (!Number.isFinite(distance) || distance < 0 || distance > 100000 || !(stars >= 0 && stars <= 3)) {
    return res.status(400).json({ error: "Invalid result" });
  }

  // A player can only save results for a level they have unlocked
  const current = await getProgress(req.session.user.id);
  if (levelId > current.unlocked) {
    return res.status(403).json({ error: "That level is still locked" });
  }

  const progress = await saveLevelResult(req.session.user.id, levelId, { distance, stars, completed });
  res.json(progress);
});

export default router;
