// End-of-run panel: "Level Complete!" or "Game Over", with the run's numbers and buttons.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.

export default function ResultPanel({ type, stats, saveMessage, hasNextLevel, onRetry, onNext, onMap }) {
  const won = type === "complete";

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#04203f]/70 p-4" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <div className={`w-full max-w-sm rounded-3xl border-4 ${won ? "border-[#f5c451]" : "border-[#ff8a5b]"} bg-linear-to-b from-[#1b6fc2] to-[#0d4a8f] p-6 text-center text-white shadow-2xl`}>
        <h2 id="result-title" className="font-game text-4xl">{won ? "Level Complete!" : "Game Over"}</h2>
        <p className="mt-1 text-[#cdeeff]">{won ? "You reached the gate!" : "Your shark swam its last lap."}</p>

        {won && (
          <div className="mt-3 flex justify-center gap-1" aria-label={`${stats.stars} of 3 stars`}>
            {[1, 2, 3].map((n) => (
              <svg key={n} viewBox="0 0 24 24" className="h-9 w-9" aria-hidden="true">
                <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" fill={n <= stats.stars ? "#ffc83d" : "#0a3d75"} stroke="#b07a00" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Tile label="Score" value={stats.score} />
          <Tile label="Fish" value={stats.fish} />
          <Tile label="Distance" value={`${stats.distance}m`} />
        </div>

        {saveMessage && <p className="mt-3 text-sm text-[#cdeeff]">{saveMessage}</p>}

        <div className="mt-5 flex flex-col gap-2">
          {won && hasNextLevel && (
            <button type="button" onClick={onNext} className="rounded-2xl border-4 border-[#1f8a2e] bg-linear-to-b from-[#5ee35b] to-[#25b23a] py-2.5 font-game text-xl [text-shadow:0_2px_0_#0f5a1a]">
              Next level
            </button>
          )}
          <button type="button" onClick={onRetry} className="rounded-2xl border-4 border-[#c77a12] bg-linear-to-b from-[#ffd36a] to-[#f5a524] py-2.5 font-game text-xl [text-shadow:0_2px_0_#8a4a12]">
            {won ? "Play again" : "Try again"}
          </button>
          <button type="button" onClick={onMap} className="rounded-2xl border-2 border-[#4fd6ff] py-2.5 font-bold hover:bg-white/10">
            Back to map
          </button>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value }) {
  return (
    <div className="rounded-xl bg-[#0a3d75] p-2">
      <div className="font-game text-2xl">{value}</div>
      <div className="text-xs text-[#bfe9ff]">{label}</div>
    </div>
  );
}
