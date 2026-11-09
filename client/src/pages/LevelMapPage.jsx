// Level map page: loads THIS player's progress from the server and shows one card per level.
// Level data comes from config/levels.js, progress from progressService, cards from LevelCard –
// this page only puts them together (low coupling).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
// Background in /assets/levelmap/ – exported from my Figma design.
import { useEffect, useState } from "react";
import { LEVELS } from "../config/levels";
import { getProgress } from "../api/progressService";
import LevelCard from "../components/LevelCard";
import Bubbles from "../components/Bubbles";

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
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/45 px-4 py-3 backdrop-blur-sm">
          <img src="/assets/login/logo.png" alt="Shark Runner" className="h-10 w-auto" />
          <nav className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-[#0b1a3a] px-4 py-2 text-sm font-semibold text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-[#7ee8ff] shadow-[0_0_6px_#7ee8ff]" aria-hidden="true" />
              {user?.username}
            </span>
            <button onClick={onLeaderboard} className="flex items-center gap-2 rounded-full bg-[#0b1a3a] px-4 py-2 text-sm font-semibold text-white">
              <TrophyIcon />
              Leaderboard
            </button>
            <button onClick={onLogout} className="rounded-full bg-[#0b1a3a] px-4 py-2 text-sm font-semibold text-white">
              Logout
            </button>
            <button
              onClick={() => setSoundOn((on) => !on)}
              aria-label={soundOn ? "Mute sound" : "Turn sound on"}
              aria-pressed={!soundOn}
              className="grid h-9 w-9 place-items-center rounded-full text-[#0b1a3a] hover:bg-white/50"
            >
              <SoundIcon on={soundOn} />
            </button>
          </nav>
        </header>

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

function SoundIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {on ? <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /> : <path d="M17 9l5 6M22 9l-5 6" />}
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M7 3h10v3h3v2a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V6h3zm0 5V8H6a2 2 0 0 0 1 1.7zm10 0v1.7A2 2 0 0 0 18 8z" />
    </svg>
  );
}
