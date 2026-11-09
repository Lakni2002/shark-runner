
import { RULES } from "../config/levels";

// Current area, distance progress, next gate, next chest
export function AreaInfo({ level, stats }) {
  const progress = Math.min(100, (stats.distance / level.targetMetres) * 100);
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border-2 border-[#4fd6ff]/60 bg-[#0a3d75]/70 p-3">
        <p className="text-xs font-bold tracking-widest text-[#9fe7ff]">CURRENT AREA</p>
        <p className="mt-1 text-xl font-extrabold">{level.name}</p>
        <p className="mt-1 text-sm text-[#cdeeff]">{stats.distance} m / {level.targetMetres} m</p>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#06294f]" role="progressbar" aria-valuemin={0} aria-valuemax={level.targetMetres} aria-valuenow={stats.distance} aria-label="Distance to the gate">
          <div className="h-full rounded-full bg-linear-to-r from-[#5ee35b] to-[#25b23a] transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#9fe7ff]">NEXT GATE</p>
          <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-lg font-extrabold"><FlagIcon /> {level.targetMetres} m</p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-[#9fe7ff]">NEXT CHEST</p>
          <p className="mt-1 whitespace-nowrap text-lg font-extrabold">{stats.fishSinceChest} / {RULES.fishPerChest} <span className="text-sm font-semibold">fish</span></p>
        </div>
      </div>
    </div>
  );
}

// Controls and rules
export function HowToPlay({ touch }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-game text-2xl">HOW TO PLAY</h2>
      {touch ? (
        <p className="rounded-xl bg-[#0a3d75]/70 px-3 py-2 text-sm font-semibold">Drag your finger on the game to steer the shark.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[["←", "Left"], ["→", "Right"], ["↑", "Up"], ["↓", "Down"]].map(([key, name]) => (
            <div key={name}>
              <kbd className="grid h-10 place-items-center rounded-lg border-2 border-white/70 bg-[#1663b8] text-lg font-bold">{key}</kbd>
              <span className="mt-1 block">{name}</span>
            </div>
          ))}
        </div>
      )}
      <ul className="flex flex-col gap-2 border-t border-white/20 pt-3 text-sm font-semibold">
        <Rule colour="#ff9f1c">Collect fish: +{RULES.fishPoints}</Rule>
        <Rule colour="#f5c451">Every {RULES.fishPerChest} fish: treasure chest puzzle (+{RULES.chestPoints})</Rule>
        <Rule colour="#4fd6ff">Every {RULES.speedUpEveryMetres} m: faster</Rule>
        <Rule colour="#ff5b4a">Avoid mines: {RULES.lives} hits = second-chance puzzle</Rule>
      </ul>
    </div>
  );
}

function Rule({ colour, children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colour }} aria-hidden="true" />
      {children}
    </li>
  );
}

// ---------- Icons (used by the navbar too) ----------
export function FlagIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" fill="currentColor" />
    </svg>
  );
}

export function StarIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" fill="#ffc83d" stroke="#b07a00" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Heart({ full, className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 21s-8-5.3-8-11.5A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8 2.9C20 15.7 12 21 12 21z" fill={full ? "#ff5b6e" : "none"} stroke={full ? "#7a1022" : "#cdeeff"} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function PauseIcon({ paused, className = "h-6 w-6" }) {
  return paused ? (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
  );
}
