// App decides which page to show and keeps track of who is logged in.
// Pages only report events (onStart, onLoggedIn, onPlay...) – App decides where to go.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { useState } from "react";
import WelcomePage from "./pages/WelcomePage";
import AuthPage from "./pages/AuthPage";
import LevelMapPage from "./pages/LevelMapPage";
import GamePage from "./pages/GamePage";
import { LEVELS } from "./config/levels";
import { logout } from "./api/authService";

export default function App() {
  const [page, setPage] = useState("welcome");
  const [user, setUser] = useState(null); // the logged-in player
  const [level, setLevel] = useState(null); // the level being played

  const handleLoggedIn = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("levelmap");
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setPage("welcome");
  };

  const handlePlay = (chosenLevel) => {
    setLevel(LEVELS.find((l) => l.id === chosenLevel.id)); // full settings from config
    setPage("game");
  };

  const nextLevel = level && LEVELS.find((l) => l.id === level.id + 1);

  if (page === "welcome") return <WelcomePage onStart={() => setPage("auth")} />;
  if (page === "auth") return <AuthPage onLoggedIn={handleLoggedIn} />;
  if (page === "levelmap")
    return (
      <LevelMapPage
        user={user}
        onPlay={handlePlay}
        onLeaderboard={() => setPage("leaderboard")}
        onLogout={handleLogout}
      />
    );
  if (page === "game")
    return (
      <GamePage
        key={level.id} // a new level = a fresh game page
        level={level}
        hasNextLevel={Boolean(nextLevel)}
        onNextLevel={() => setLevel(nextLevel)}
        onExit={() => setPage("levelmap")}
      />
    );

  // Temporary screen until the leaderboard page is built
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 text-center">
      <p className="text-xl">Leaderboard coming soon</p>
      <button onClick={() => setPage("levelmap")} className="rounded-xl bg-aqua px-6 py-3 font-bold text-navy">
        Back to map
      </button>
    </div>
  );
}
