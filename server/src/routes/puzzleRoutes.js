// Puzzle routes: give the player a Fish API puzzle and check their answer.
// The correct answer is kept in the player's SESSION on the server – the browser only gets the picture.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { Router } from "express";
import requireLogin from "../middleware/requireLogin.js";
import { fetchPuzzle } from "../services/fishApiClient.js";

const router = Router();
const TIME_LIMIT_SECONDS = 15;
const GRACE_SECONDS = 3; // allow for slow networks

// GET /api/puzzle → { image, timeLimit }
router.get("/", requireLogin, async (req, res) => {
  try {
    const puzzle = await fetchPuzzle();
    // Remember the answer for THIS player only
    req.session.puzzle = { fish: puzzle.fish, chests: puzzle.chests, issuedAt: Date.now() };
    res.json({ image: puzzle.image, timeLimit: TIME_LIMIT_SECONDS });
  } catch (err) {
    console.error("Fish API problem:", err.message);
    res.status(502).json({ error: "The Fish API is not responding right now." });
  }
});

// POST /api/puzzle/answer  { fish, chests } → { correct, timedOut, answer }
router.post("/answer", requireLogin, (req, res) => {
  const puzzle = req.session.puzzle;
  if (!puzzle) return res.status(400).json({ error: "There is no puzzle to answer." });
  delete req.session.puzzle; // one answer per puzzle – no guessing again and again

  const secondsTaken = (Date.now() - puzzle.issuedAt) / 1000;
  const timedOut = secondsTaken > TIME_LIMIT_SECONDS + GRACE_SECONDS;
  const correct =
    !timedOut && Number(req.body.fish) === puzzle.fish && Number(req.body.chests) === puzzle.chests;

  // The answer is only revealed AFTER the player has answered
  res.json({ correct, timedOut, answer: { fish: puzzle.fish, chests: puzzle.chests } });
});

export default router;
