// One level card on the level map. It only SHOWS a level in one of three states
// (completed / active / locked) and reports a click – it doesn't know what happens next.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.

const BADGE = {
  completed: { text: "COMPLETED", className: "bg-[#2fc24a] text-[#0b2e12]" },
  active: { text: "TARGET ACTIVE", className: "bg-[#14306b] text-white" },
  locked: { text: "LOCKED", className: "bg-[#14306b]/80 text-white" },
};

export default function LevelCard({ level, status, best, onPlay }) {
  const locked = status === "locked";
  const number = String(level.id).padStart(2, "0"); // 1 → "01"

  return (
    <article
      className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3 sm:gap-5 sm:px-5 ${
        locked
          ? "border-[#8fe3ff]/80 bg-[#0d4f9a]/70 text-white"
          : "border-[#0b1a3a] bg-linear-to-b from-[#e8f3ff] to-[#9fcbf5] text-[#0b1a3a] shadow-[0_4px_0_rgba(11,26,58,0.35)]"
      }`}
    >
      {/* Level number in a circle */}
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 text-2xl font-bold sm:h-16 sm:w-16 sm:text-3xl ${
          locked ? "border-[#8fe3ff] bg-[#0d4f9a] text-white" : "border-[#4fb7ff] bg-[#0f4bb8] text-white"
        }`}
      >
        {number}
      </div>

      {/* Name, description, stars */}
      <div className="min-w-0 flex-1">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide ${BADGE[status].className}`}>
          {locked && <LockIcon />}
          {BADGE[status].text}
        </span>
        <h2 className="mt-1 text-xl font-extrabold leading-tight sm:text-2xl">{level.name}</h2>
        <p className={`text-sm font-semibold ${locked ? "text-white/85" : "text-[#0b1a3a]/85"}`}>
          {level.description} – {level.targetMetres}m
        </p>
        {status === "completed" && best && (
          <div className="mt-1 flex items-center gap-4">
            <Stars count={best.stars} />
            <span className="text-sm font-bold">Best: {best.distance}m</span>
          </div>
        )}
      </div>

      {/* Button (no button on locked levels) */}
      {!locked && (
        <button
          type="button"
          onClick={() => onPlay(level)} // click EVENT → tell the page which level
          className={`shrink-0 rounded-xl border-4 px-4 py-2 font-game text-lg tracking-wide shadow-[0_4px_0_rgba(0,0,0,0.25)]
            transition-transform hover:-translate-y-0.5 active:translate-y-0.5 sm:px-6 sm:text-xl
            focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#0b1a3a]
            ${status === "completed"
              ? "border-[#1f8a2e] bg-linear-to-b from-[#5ee35b] to-[#25b23a] text-white [text-shadow:0_2px_0_#0f5a1a]"
              : "border-[#c77a12] bg-linear-to-b from-[#ffd36a] to-[#f5a524] text-[#3a1f00]"}`}
        >
          {status === "completed" ? "SWIM AGAIN" : "DIVE NOW"}
        </button>
      )}
    </article>
  );
}

function Stars({ count }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z"
            fill={n <= count ? "#ffc83d" : "none"}
            stroke="#b07a00"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
