// Game page: top bar + side panels (React) around the Phaser game, plus the popups.
// It LISTENS to events from the game (EventBus), opens the puzzle popup, saves results through
// progressService, and SENDS the puzzle result back to the game. It contains no game rules itself.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
// Level backgrounds in /assets/game/levels/ – exported from my Figma design.
import { useEffect, useState } from "react";
import PhaserGame from "../game/PhaserGame";
import { EventBus } from "../game/EventBus";
import { RULES } from "../config/levels";
import { saveResult } from "../api/progressService";
import PuzzlePopup from "../components/PuzzlePopup";
import ResultPanel from "../components/ResultPanel";

const START_STATS = { score: 0, lives: RULES.lives, fish: 0, fishSinceChest: 0, distance: 0, speed: "1.0" };

export default function GamePage({ level, hasNextLevel, onNextLevel, onExit }) {
  const [stats, setStats] = useState(START_STATS);
  const [puzzleMode, setPuzzleMode] = useState(null); // "treasure" | "second-chance" | null
  const [ending, setEnding] = useState(null); // { type: "complete" | "over", stats }
  const [saveMessage, setSaveMessage] = useState("");
  const [paused, setPaused] = useState(false);

  // Listen to EVENTS from the Phaser game
  useEffect(() => {
    const onStats = (s) => setStats(s);
    const onChest = () => setPuzzleMode("treasure");
    const onOutOfLives = () => setPuzzleMode("second-chance");
    const onComplete = (s) => endRun("complete", s);
    const onOver = (s) => endRun("over", s);

    EventBus.on("stats-changed", onStats);
    EventBus.on("chest-collected", onChest);
    EventBus.on("out-of-lives", onOutOfLives);
    EventBus.on("level-complete", onComplete);
    EventBus.on("game-over", onOver);
    return () => {
      EventBus.off("stats-changed", onStats);
      EventBus.off("chest-collected", onChest);
      EventBus.off("out-of-lives", onOutOfLives);
      EventBus.off("level-complete", onComplete);
      EventBus.off("game-over", onOver);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id]);

  // A run ended → show the panel and save the result to the player's account
  const endRun = async (type, runStats) => {
    setEnding({ type, stats: runStats });
    setSaveMessage("Saving your result…");
    try {
      await saveResult(level.id, {
        score: runStats.score,
        distance: runStats.distance,
        stars: type === "complete" ? runStats.stars : 0,
        completed: type === "complete",
      });
      setSaveMessage(type === "complete" ? "Saved! The next ocean is unlocked." : "Your best distance is saved.");
    } catch (err) {
      setSaveMessage(`Could not save: ${err.message}`);
    }
  };

  // Puzzle finished → tell the game what happened
  const handlePuzzleDone = (result) => {
    setPuzzleMode(null);
    EventBus.emit("puzzle-result", result);
  };

  const togglePause = () => {
    if (puzzleMode || ending) return;
    EventBus.emit(paused ? "resume-game" : "pause-game");
    setPaused(!paused);
  };

  const retry = () => {
    setEnding(null);
    setStats(START_STATS);
    EventBus.emit("restart-game");
  };

  const progress = Math.min(100, (stats.distance / level.targetMetres) * 100);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#0d5f8f] font-ui text-white">
      <img src={level.background} alt="" className="absolute inset-0 h-full w-full object-cover" />

      {/* ---------- Top bar ---------- */}
      <header className="relative z-10 mx-3 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/35 px-4 py-2 backdrop-blur-sm sm:mx-6">
        <button type="button" onClick={onExit} className="flex items-center gap-2 rounded-xl px-1 hover:bg-white/30" aria-label="Back to the level map">
          <img src="/assets/login/logo.png" alt="" className="h-10 w-auto" />
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Chip label="Distance" value={`${stats.distance} m`} />
          <Chip label="Score" value={stats.score.toLocaleString()} />
          <Chip label="Level" value={level.id} />
          <span className="flex items-center gap-1 rounded-full bg-[#1663b8] px-3 py-1.5" aria-label={`${stats.lives} lives left`}>
            {Array.from({ length: RULES.lives }, (_, i) => <Heart key={i} full={i < stats.lives} />)}
          </span>
        </div>
      </header>

      {/* ---------- Main area: left panel | game | right panel ---------- */}
      <main className="relative z-10 flex min-h-0 flex-1 items-stretch justify-center gap-4 p-3 sm:p-5">
        {/* Left panel */}
        <aside className="hidden w-56 shrink-0 flex-col gap-4 self-start rounded-2xl border-2 border-[#4fd6ff]/70 bg-[#0d4a8f]/80 p-4 lg:flex">
          <div className="rounded-xl border-2 border-[#4fd6ff]/60 bg-[#0a3d75]/70 p-3">
            <p className="text-xs font-bold tracking-widest text-[#9fe7ff]">CURRENT AREA</p>
            <p className="mt-1 text-xl font-extrabold">{level.name}</p>
            <p className="mt-1 text-sm text-[#cdeeff]">{stats.distance} m / {level.targetMetres} m</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#06294f]">
              <div className="h-full rounded-full bg-linear-to-r from-[#5ee35b] to-[#25b23a] transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-[#9fe7ff]">NEXT GATE</p>
            <p className="mt-1 text-2xl font-extrabold">🏁 {level.targetMetres} m</p>
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-[#9fe7ff]">NEXT CHEST</p>
            <p className="mt-1 font-bold">{stats.fishSinceChest} / {RULES.fishPerChest} fish</p>
          </div>
        </aside>

        {/* Game (keeps the 2:3 shape and fills the height) */}
        <div className="relative h-full max-w-full aspect-[2/3] overflow-hidden rounded-3xl border-4 border-[#4fd6ff] shadow-2xl">
          <PhaserGame key={level.id} level={level} />

          {/* Progress bar on top of the game */}
          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center gap-3">
            <div className="relative h-3 flex-1 rounded-full bg-[#06294f]/80">
              <div className="h-full rounded-full bg-[#4fd6ff]" style={{ width: `${progress}%` }} />
              <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff7a29]" style={{ left: `${progress}%` }} />
            </div>
            <span className="text-xl" aria-hidden="true">🏁</span>
          </div>

          <button type="button" onClick={togglePause} aria-label={paused ? "Resume game" : "Pause game"} className="absolute right-3 top-10 grid h-11 w-11 place-items-center rounded-xl border-2 border-white/80 bg-[#1663b8]/80 lg:hidden">
            <PauseIcon paused={paused} />
          </button>

          {paused && !puzzleMode && !ending && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#04203f]/60">
              <div className="rounded-3xl bg-[#0d4a8f] p-6 text-center shadow-2xl">
                <p className="font-game text-4xl">Paused</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button type="button" onClick={togglePause} className="rounded-xl bg-[#4fd6ff] px-8 py-2.5 font-bold text-[#0b1a3a]">Resume</button>
                  <button type="button" onClick={onExit} className="rounded-xl border-2 border-[#4fd6ff] px-8 py-2.5 font-bold">Back to map</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <aside className="hidden w-60 shrink-0 flex-col gap-4 self-start rounded-2xl border-2 border-[#4fd6ff]/70 bg-[#0d4a8f]/80 p-4 lg:flex">
          <h2 className="font-game text-2xl">HOW TO PLAY</h2>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[["←", "Left"], ["→", "Right"], ["↑", "Up"], ["↓", "Down"]].map(([key, name]) => (
              <div key={name}>
                <kbd className="grid h-10 place-items-center rounded-lg border-2 border-white/70 bg-[#1663b8] text-lg font-bold">{key}</kbd>
                <span className="mt-1 block">{name}</span>
              </div>
            ))}
          </div>
          <ul className="flex flex-col gap-2 border-t border-white/20 pt-3 text-sm font-semibold">
            <li>🐟 Collect fish: +{RULES.fishPoints}</li>
            <li>💰 Every {RULES.fishPerChest} fish: treasure chest puzzle (+{RULES.chestPoints})</li>
            <li>⚡ Every {RULES.speedUpEveryMetres} m: faster</li>
            <li>💣 Avoid mines: {RULES.lives} hits = second-chance puzzle</li>
          </ul>
          <button type="button" onClick={togglePause} aria-label={paused ? "Resume game" : "Pause game"} className="grid h-12 w-12 place-items-center rounded-xl border-2 border-white/80 bg-[#1663b8] hover:bg-[#1d74d4]">
            <PauseIcon paused={paused} />
          </button>
        </aside>

        {/* Popups */}
        {puzzleMode && <PuzzlePopup key={puzzleMode + stats.fish} mode={puzzleMode} onDone={handlePuzzleDone} />}
        {ending && (
          <ResultPanel
            type={ending.type}
            stats={ending.stats}
            saveMessage={saveMessage}
            hasNextLevel={hasNextLevel}
            onRetry={retry}
            onNext={onNextLevel}
            onMap={onExit}
          />
        )}
      </main>
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <span className="flex flex-col items-center rounded-full bg-[#1663b8] px-4 py-1 leading-tight">
      <span className="text-[11px] font-semibold text-[#cdeeff]">{label}</span>
      <span className="font-extrabold">{value}</span>
    </span>
  );
}

function Heart({ full }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M12 21s-8-5.3-8-11.5A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8 2.9C20 15.7 12 21 12 21z" fill={full ? "#ff5b6e" : "none"} stroke={full ? "#7a1022" : "#cdeeff"} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon({ paused }) {
  return paused ? (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
  );
}
