// requireLogin: put this in front of any route that only logged-in players may use
// (e.g. saving a score or getting a puzzle). Used in later steps.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
export default function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please log in first" });
  }
  next();
}
