
import { useEffect, useState } from "react";
import PhaserGame from "../game/PhaserGame";
import { EventBus } from "../game/EventBus";
import { RULES } from "../config/levels";
import { saveResult } from "../api/progressService";
import PuzzlePopup from "../components/PuzzlePopup";
import ResultPanel from "../components/ResultPanel";
import GameNavbar from "../components/GameNavbar";
import { AreaInfo, HowToPlay, FlagIcon, PauseIcon } from "../components/GameInfo";

const START_STATS = { score: 0, lives: RULES.lives, fish: 0, fishSinceChest: 0, distance: 0, speed: "1.0" };

// Touch screen? (used to show "drag to steer" instead of arrow keys)
const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export default function GamePage({ user, level, hasNextLevel, onNextLevel, onExit }) {
  const [stats, setStats] = useState(START_STATS);
  const [puzzleMode, setPuzzleMode] = useState(null); // "treasure" | "second-chance" | null
  const [ending, setEnding] = useState(null); // { type: "complete" | "over", stats }
  const [saveMessage, setSaveMessage] = useState("");
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // phone/tablet menu

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
    setMenuOpen(false);
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

  const canPause = !puzzleMode && !ending;
  const pause = () => {
    if (!canPause || paused) return;
    EventBus.emit("pause-game");
    setPaused(true);
  };
  const resume = () => {
    if (!canPause || !paused) return;
    EventBus.emit("resume-game");
    setPaused(false);
  };
  const togglePause = () => (paused ? resume() : pause());

  // Phone menu: opening it pauses the game, closing it lets the player resume
  const openMenu = () => {
    pause();
    setMenuOpen(true);
  };
  const closeMenu = () => setMenuOpen(false);

  // Escape key EVENT closes the menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const retry = () => {
    setEnding(null);
    setStats(START_STATS);
    EventBus.emit("restart-game");
  };

  const progress = Math.min(100, (stats.distance / level.targetMetres) * 100);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#0d5f8f] font-ui text-white">
      <img src={level.background} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <GameNavbar level={level} stats={stats} playerName={user?.username} onExit={onExit} onOpenMenu={openMenu} menuOpen={menuOpen} />

      {/* ---------- Main area: left panel | game | right panel ---------- */}
      <main className="relative z-10 flex min-h-0 flex-1 gap-4 p-2 sm:p-4 lg:p-5">
        {/* Left panel (laptop only) */}
        <aside className="hidden w-56 shrink-0 self-start rounded-2xl border-2 border-[#4fd6ff]/70 bg-[#0d4a8f]/80 p-4 lg:block">
          <AreaInfo level={level} stats={stats} />
        </aside>

        {/* Game column. "containerType: size" lets the box below measure this column,
            so the game box is always exactly 2:3 and as big as fits – no empty strips. */}
        <div className="flex min-w-0 flex-1 items-center justify-center" style={{ containerType: "size" }}>
          <div className="relative aspect-[2/3] w-[min(100cqw,calc(100cqh*2/3))] overflow-hidden rounded-2xl border-4 border-[#4fd6ff] shadow-2xl sm:rounded-3xl">
            <PhaserGame key={level.id} level={level} />

            {/* Progress bar on top of the game */}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center gap-2">
              <div className="relative h-2.5 flex-1 rounded-full bg-[#06294f]/80 sm:h-3">
                <div className="h-full rounded-full bg-[#4fd6ff]" style={{ width: `${progress}%` }} />
                <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ff7a29] sm:h-5 sm:w-5" style={{ left: `${progress}%` }} />
              </div>
              <FlagIcon className="h-5 w-5 drop-shadow" />
            </div>

            {/* Paused screen */}
            {paused && !menuOpen && canPause && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#04203f]/60 p-4">
                <div className="w-full max-w-60 rounded-3xl bg-[#0d4a8f] p-6 text-center shadow-2xl">
                  <p className="font-game text-4xl">Paused</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button type="button" onClick={resume} autoFocus className="rounded-xl bg-[#4fd6ff] py-2.5 font-bold text-[#0b1a3a]">Resume</button>
                    <button type="button" onClick={onExit} className="rounded-xl border-2 border-[#4fd6ff] py-2.5 font-bold">Back to map</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel (laptop only) */}
        <aside className="hidden w-60 shrink-0 flex-col gap-4 self-start rounded-2xl border-2 border-[#4fd6ff]/70 bg-[#0d4a8f]/80 p-4 lg:flex">
          <HowToPlay touch={isTouch} />
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

      {/* ---------- Phone/tablet menu (slides in from the right) ---------- */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={closeMenu} className="absolute inset-0 bg-[#04203f]/60" />
          <nav id="game-menu" aria-label="Game menu" className="absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col gap-5 overflow-y-auto bg-[#0d4a8f] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-game text-2xl">Level {level.id} · {level.name}</p>
                {user?.username && (
                  <p className="truncate text-sm font-semibold text-[#cdeeff]">
                    Playing as <span className="font-extrabold text-white">{user.username}</span>
                  </p>
                )}
              </div>
              <button type="button" onClick={closeMenu} autoFocus aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full border-2 border-white text-xl font-bold">✕</button>
            </div>

            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => { closeMenu(); resume(); }} className="flex items-center justify-center gap-2 rounded-xl bg-[#4fd6ff] py-3 font-bold text-[#0b1a3a]">
                <PauseIcon paused className="h-5 w-5" /> Resume game
              </button>
              <button type="button" onClick={onExit} className="rounded-xl border-2 border-[#4fd6ff] py-3 font-bold">Back to map</button>
            </div>

            <AreaInfo level={level} stats={stats} />
            <HowToPlay touch={isTouch} />
          </nav>
        </div>
      )}
    </div>
  );
}
