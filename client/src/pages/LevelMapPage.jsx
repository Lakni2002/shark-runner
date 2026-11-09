
import { useEffect, useState } from "react";
import { LEVELS } from "../config/levels";
import { getProgress } from "../api/progressService";
import LevelCard from "../components/LevelCard";
import Bubbles from "../components/Bubbles";
import TopNavbar from "../components/TopNavbar";

export default function LevelMapPage({ user, onPlay, onLeaderboard, onLogout }) {
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [soundOn, setSoundOn] = useState(true);

  // When the page opens (EVENT), ask the server for this player's progress
  useEffect(() => {
    getProgress()
      .then(setProgress)
      .catch((err) => setError(err.message));
  }, []);

  // Work out each level's state from the progress
  const statusOf = (level) => {
    if (level.id < progress.unlocked) return "completed";
    if (level.id === progress.unlocked) return "active";
    return "locked";
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#14a7c9] font-ui">
      <img src="/assets/levelmap/background.png" alt="" className="fixed inset-0 h-full w-full object-cover" />
      <Bubbles count={12} />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-6 px-4 py-5">
        {/* Top bar */}
        <TopNavbar
          active="levels"
          playerName={user?.username}
          onLeaderboard={onLeaderboard}
          onLogout={onLogout}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((on) => !on)}
        />

        {/* Title */}
        <div className="text-center">
          <p className="font-game text-sm tracking-[0.3em] text-white [-webkit-text-stroke:1px_#0b1a3a]">YOUR ADVENTURE</p>
          <h1 className="font-game text-4xl text-[#ff8a1f] [-webkit-text-stroke:2px_#3a1300] [paint-order:stroke_fill] drop-shadow-[0_3px_0_rgba(58,19,0,0.4)] sm:text-5xl">
            Choose your ocean
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#0b1a3a]">
            Swim the distance and solve the gate puzzle to unlock the next area.
          </p>
        </div>

        {/* Level cards */}
        {error && <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-center font-semibold text-red-700">{error}</p>}
        {!progress && !error && <p className="text-center font-semibold text-white">Loading your progress…</p>}

        {progress && (
          <div className="flex flex-col gap-4">
            {LEVELS.map((level) => (
              <LevelCard
                key={level.id}
                level={level}
                status={statusOf(level)}
                best={progress.best[level.id]}
                onPlay={onPlay}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

