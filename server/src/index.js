
import express from "express";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import puzzleRoutes from "./routes/puzzleRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json()); // read JSON bodies sent by the browser

// Sessions = the server remembers who is logged in.
// The browser only keeps a small random cookie (the session id); the user data stays on the server.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret-in-production",
    resave: false,
    saveUninitialized: false, // no cookie until someone logs in
    cookie: {
      httpOnly: true, // JavaScript in the page cannot read the cookie (protects against XSS)
      sameSite: "lax", // the cookie is not sent from other websites (protects against CSRF)
      // maxAge is set at login: "Remember me" keeps it for 30 days
    },
  })
);

// Routes (each file handles one area)
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/puzzle", puzzleRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
