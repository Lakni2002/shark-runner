
import { useEffect, useState } from "react";
import { LEVELS } from "../config/levels";
import { getLeaderboard } from "../api/leaderboardService";
import LeaderboardTable from "../components/LeaderboardTable";
import Bubbles from "../components/Bubbles";
import TopNavbar from "../components/TopNavbar";

export default function LeaderboardPage({ user, onLevels, onLogout }) {
  const [period, setPeriod] = useState("all"); // "all" | "week"
  const [level, setLevel] = useState("all"); // "all" | 1-4
  const [searchText, setSearchText] = useState(""); // what is typed
  const [search, setSearch] = useState(""); // what we actually search for (after a short pause)
  const [page, setPage] = useState(1);
  const [board, setBoard] = useState(null); // { rows, total, page, totalPages, me }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Typing EVENT: wait 300 ms after the last key before searching (not on every key)
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchText);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchText]);

  // Whenever a filter or the page changes, load that page from the server
  useEffect(() => {
    let current = true; // ignore old answers if the filters changed again meanwhile
    setLoading(true);
    getLeaderboard({ period, level, search, page })
      .then((data) => current && (setBoard(data), setError("")))
      .catch((err) => current && setError(err.message))
      .finally(() => current && setLoading(false));
    return () => (current = false);
  }, [period, level, search, page]);

  const choosePeriod = (p) => { setPeriod(p); setPage(1); };
  const chooseLevel = (l) => { setLevel(l); setPage(1); };

  const pageSize = 8;
  const from = board && board.total > 0 ? (board.page - 1) * pageSize + 1 : 0;
  const to = board ? Math.min(board.page * pageSize, board.total) : 0;
  const meOnPage = board?.rows.some((r) => r.isMe);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#14a7c9] font-ui text-white">
      <img src="/assets/leaderboard/background.png" alt="" className="fixed inset-0 h-full w-full object-cover" />
      <Bubbles count={12} />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-5 px-4 py-5">
        {/* Top bar */}
        <TopNavbar active="leaderboard" playerName={user?.username} onLevels={onLevels} onLogout={onLogout} />

        {/* Title + filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-game text-4xl sm:text-5xl [-webkit-text-stroke:2px_#0b1a3a] [paint-order:stroke_fill]">
            Top <span className="text-[#ffb020]">Sharks</span>
          </h1>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {/* All Time / This Week */}
            <div role="tablist" aria-label="Time period" className="flex rounded-xl bg-[#0b1a3a] p-1">
              {[["all", "All Time"], ["week", "This Week"]].map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={period === value}
                  onClick={() => choosePeriod(value)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-bold ${period === value ? "bg-[#1663b8]" : "text-white/80 hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Level filter */}
            <label className="sr-only" htmlFor="level-filter">Level</label>
            <select
              id="level-filter"
              value={level}
              onChange={(e) => chooseLevel(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="rounded-xl border-2 border-white/70 bg-[#e9f6ff] px-3 py-1.5 text-sm font-bold text-[#0b1a3a]"
            >
              <option value="all">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            {/* Search */}
            <label className="sr-only" htmlFor="player-search">Search player</label>
            <input
              id="player-search"
              type="search"
              placeholder="Search player…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full rounded-xl border-2 sm:w-44 border-white/70 bg-[#e9f6ff] px-3 py-1.5 text-sm font-semibold text-[#0b1a3a] placeholder:text-[#6b85a3]"
            />
          </div>
        </div>

        {/* Table */}
        <section className="rounded-3xl border-4 border-[#4fd6ff] bg-[#0a3d75]/75 p-3 shadow-2xl sm:p-4" aria-busy={loading}>
          {error && <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-center font-semibold text-red-700">{error}</p>}
          {!error && board && board.rows.length > 0 && <LeaderboardTable rows={board.rows} />}
          {!error && board && board.rows.length === 0 && (
            <p className="py-10 text-center font-semibold text-[#cdeeff]">
              {search ? `No player called "${search}".` : "No scores yet. Be the first shark on the board!"}
            </p>
          )}
          {!board && !error && <p className="py-10 text-center font-semibold text-[#cdeeff]">Loading the leaderboard…</p>}

          {/* Your own rank, if you are not on this page */}
          {board?.me && !meOnPage && (
            <p className="mt-3 rounded-xl border-2 border-[#ffd34d] bg-[#2f6f9e] px-4 py-2 text-sm font-bold">
              Your rank: #{board.me.rank} · {board.me.score.toLocaleString()} points · {board.me.bestDistance} m
            </p>
          )}
        </section>

        {/* Footer: count + page buttons */}
        {board && (
          <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-[#4fd6ff] bg-[#0d4a8f]/90 px-4 py-3">
            <div>
              <p className="font-semibold">
                Showing {from}–{to} of {board.total.toLocaleString()} ranked shark runners
              </p>
              <p className="flex items-center gap-1.5 text-xs font-bold text-[#5ee35b]">
                <span className="h-2 w-2 rounded-full bg-[#5ee35b]" aria-hidden="true" /> {period === "week" ? "THIS WEEK" : "ALL TIME"}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={board.page <= 1}
                className="rounded-xl border-2 border-[#4fd6ff] bg-[#1663b8] px-4 py-1.5 font-bold disabled:opacity-40"
              >
                ‹ Prev
              </button>
              <span className="font-extrabold" aria-live="polite">
                PAGE {String(board.page).padStart(2, "0")} / {board.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={board.page >= board.totalPages}
                className="rounded-xl border-2 border-[#c77a12] bg-linear-to-b from-[#ffd36a] to-[#f5a524] px-4 py-1.5 font-bold text-[#3a1f00] disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}

