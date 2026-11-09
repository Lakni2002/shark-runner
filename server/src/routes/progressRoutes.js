
import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import { getProgress, saveLevelResult } from "../services/progressStore.js";
import { addRun } from "../services/scoreStore.js";

const router = Router();
const LEVEL_COUNT = 4;

// GET /api/progress → { unlocked, best }
router.get("/", requireLogin, async (req, res) => {
  const progress = await getProgress(req.session.user.id);
  res.json(progress);
});

// POST /api/progress/:levelId  { score, distance, stars, completed } → updated progress
router.post("/:levelId", requireLogin, async (req, res) => {
  const levelId = Number(req.params.levelId);
  const distance = Math.floor(Number(req.body.distance));
  const stars = Math.floor(Number(req.body.stars));
  const score = Math.floor(Number(req.body.score));
  const completed = req.body.completed === true;

  // Check the data before saving it
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > LEVEL_COUNT) {
    return res.status(400).json({ error: "Unknown level" });
  }
  if (
    !Number.isFinite(distance) || distance < 0 || distance > 100000 ||
    !Number.isFinite(score) || score < 0 || score > 1000000 ||
    !(stars >= 0 && stars <= 3)
  ) {
    return res.status(400).json({ error: "Invalid result" });
  }

  // A player can only save results for a level they have unlocked
  const current = await getProgress(req.session.user.id);
  if (levelId > current.unlocked) {
    return res.status(403).json({ error: "That level is still locked" });
  }

  const progress = await saveLevelResult(req.session.user.id, levelId, { distance, stars, completed });
  // Also record the run for the leaderboard
  await addRun({ userId: req.session.user.id, username: req.session.user.username, levelId, score, distance, completed });
  res.json(progress);
});

export default router;
