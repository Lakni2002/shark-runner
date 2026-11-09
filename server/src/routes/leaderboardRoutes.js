// Leaderboard route: ranked players with filters, search and pages.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import { getLeaderboard } from "../services/scoreStore.js";

const router = Router();
const PAGE_SIZE = 8;
const LEVEL_COUNT = 4;

// GET /api/leaderboard?period=all|week&level=all|1-4&search=text&page=1
router.get("/", requireLogin, async (req, res) => {
  // Read and check the query (never trust what the browser sends)
  const period = req.query.period === "week" ? "week" : "all";
  const levelNumber = Number(req.query.level);
  const levelId = Number.isInteger(levelNumber) && levelNumber >= 1 && levelNumber <= LEVEL_COUNT ? levelNumber : null;
  const search = typeof req.query.search === "string" ? req.query.search.slice(0, 30) : "";
  const page = Math.max(1, Math.floor(Number(req.query.page)) || 1);

  const board = await getLeaderboard({
    period,
    levelId,
    search,
    page,
    pageSize: PAGE_SIZE,
    currentUserId: req.session.user.id, // so the page can highlight "YOU"
  });
  res.json(board);
});

export default router;
