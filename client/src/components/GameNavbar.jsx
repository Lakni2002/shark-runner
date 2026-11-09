
import { RULES } from "../config/levels";
import { FlagIcon, StarIcon, Heart } from "./GameInfo";

export default function GameNavbar({ level, stats, onExit, onOpenMenu, menuOpen }) {
  const hearts = (size) => (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${stats.lives} of ${RULES.lives} lives left`}>
      {Array.from({ length: RULES.lives }, (_, i) => <Heart key={i} full={i < stats.lives} className={size} />)}
    </span>
  );

  return (
    <header className="relative z-20 mx-2 mt-2 rounded-2xl bg-white/35 backdrop-blur-sm sm:mx-4 lg:mx-6 lg:mt-3">
      {/* ---------- Laptop ---------- */}
      <div className="hidden items-center justify-between gap-3 px-4 py-2 lg:flex">
        <img src="/assets/login/logo.png" alt="Shark Runner" className="h-10 w-auto" />
        <div className="flex items-center gap-2">
          <Chip label="Distance" value={`${stats.distance} m`} />
          <Chip label="Score" value={stats.score.toLocaleString()} />
          <Chip label="Level" value={level.id} />
          <span className="rounded-full bg-[#1663b8] px-3 py-2">{hearts("h-5 w-5")}</span>
          <button type="button" onClick={onExit} className="ml-2 rounded-xl bg-[#0b3f8f] px-4 py-2.5 text-sm font-bold hover:bg-[#1663b8]">
            ‹ Map
          </button>
        </div>
      </div>

      {/* ---------- Phone / tablet ---------- */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 lg:hidden">
        <button type="button" onClick={onExit} aria-label="Back to the level map" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0b3f8f] text-xl font-bold">
          ‹
        </button>
        <span className="hidden truncate pr-1 font-extrabold sm:inline">{level.name}</span>

        <div className="ml-auto flex min-w-0 items-center gap-1.5">
          <Pill label="Distance"><FlagIcon className="h-4 w-4" />{stats.distance} m</Pill>
          <Pill label="Score"><StarIcon />{stats.score.toLocaleString()}</Pill>
          <span className="rounded-full bg-[#1663b8] px-2 py-1.5">{hearts("h-4 w-4")}</span>
        </div>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open game menu"
          aria-expanded={menuOpen}
          aria-controls="game-menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0b3f8f]"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}

function Chip({ label, value }) {
  return (
    <span className="flex min-w-20 flex-col items-center rounded-full bg-[#1663b8] px-4 py-1 leading-tight">
      <span className="text-[11px] font-semibold text-[#cdeeff]">{label}</span>
      <span className="font-extrabold">{value}</span>
    </span>
  );
}

function Pill({ label, children }) {
  return (
    <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-[#1663b8] px-2.5 py-1.5 text-sm font-extrabold">
      <span className="sr-only">{label}:</span>
      {children}
    </span>
  );
}
