
import { LEVELS } from "../config/levels";

const MEDALS = {
  1: { label: "1st", className: "from-[#ffe27a] to-[#f5b31b] text-[#5a3a00] border-[#b57d00]" },
  2: { label: "2nd", className: "from-[#f2f6fb] to-[#b8c4d4] text-[#2c3a4d] border-[#7b8aa0]" },
  3: { label: "3rd", className: "from-[#ffc58f] to-[#d9813b] text-[#4a2200] border-[#9a5418]" },
};
const AVATAR_COLOURS = ["#ffb020", "#a98bff", "#ff5d73", "#4fd6ff", "#3fcf7a", "#ff8a3d", "#5b8cff"];

export default function LeaderboardTable({ rows }) {
  return (
    <>
      <PhoneCards rows={rows} />
      <BigTable rows={rows} />
    </>
  );
}

// ---------- Phones and tablets (smaller than 1024px): cards ----------
function PhoneCards({ rows }) {
  return (
    <ol className="flex flex-col gap-2 lg:hidden">
      {rows.map((row) => (
        <li
          key={`${row.rank}-${row.username}`}
          className={`rounded-2xl p-3 ${row.isMe ? "bg-[#2f6f9e] outline-2 outline-[#ffd34d]" : "bg-[#0d4a8f]/85"}`}
        >
          <div className="flex items-center gap-3">
            <Rank rank={row.rank} />
            <Avatar name={row.username} />
            <span className="min-w-0 truncate font-extrabold">{row.username}</span>
            {row.isMe && <span className="rounded-md bg-[#ffd34d] px-1.5 py-0.5 text-[11px] font-extrabold text-[#3a2a00]">YOU</span>}
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-extrabold">
              <Star />
              {row.score.toLocaleString()}
            </span>
          </div>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <Info label="Best distance" value={`${row.bestDistance.toLocaleString()} m`} />
            <Info label="Level" value={<LevelBadge levelId={row.levelReached} />} />
            <Info label="Date" value={row.date} />
          </dl>
        </li>
      ))}
    </ol>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-[#0a3d75]/70 px-2 py-1.5">
      <dt className="text-[10px] font-bold tracking-wide text-[#9fe7ff] uppercase">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

// ---------- Bigger screens: table ----------
function BigTable({ rows }) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full min-w-[720px] border-separate border-spacing-y-1.5 text-left text-white">
        <thead>
          <tr className="text-xs font-extrabold tracking-wider text-[#cdeeff]">
            <th scope="col" className="px-4 py-2">RANK</th>
            <th scope="col" className="px-4 py-2">PLAYER</th>
            <th scope="col" className="whitespace-nowrap px-4 py-2 text-right">BEST DISTANCE</th>
            <th scope="col" className="px-4 py-2 text-right">SCORE</th>
            <th scope="col" className="px-4 py-2">LEVEL REACHED</th>
            <th scope="col" className="px-4 py-2">DATE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.rank}-${row.username}`} className={row.isMe ? "outline-2 outline-[#ffd34d]" : ""}>
              <Cell first me={row.isMe}><Rank rank={row.rank} /></Cell>
              <Cell me={row.isMe}>
                <span className="flex items-center gap-3">
                  <Avatar name={row.username} />
                  <span className="font-extrabold">{row.username}</span>
                  {row.isMe && <span className="rounded-md bg-[#ffd34d] px-1.5 py-0.5 text-[11px] font-extrabold text-[#3a2a00]">YOU</span>}
                </span>
              </Cell>
              <Cell me={row.isMe} className="text-right font-bold">{row.bestDistance.toLocaleString()} m</Cell>
              <Cell me={row.isMe} className="text-right font-extrabold">
                <span className="inline-flex items-center gap-1.5"><Star />{row.score.toLocaleString()}</span>
              </Cell>
              <Cell me={row.isMe}><LevelBadge levelId={row.levelReached} /></Cell>
              <Cell last me={row.isMe} className="text-sm text-[#cdeeff]">{row.date}</Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// One table cell; the first and last cells get the rounded corners of the row
function Cell({ children, first, last, me, className = "" }) {
  return (
    <td
      className={`whitespace-nowrap px-4 py-2.5 ${me ? "bg-[#2f6f9e]" : "bg-[#0d4a8f]/85"} ${first ? "rounded-l-xl" : ""} ${last ? "rounded-r-xl" : ""} ${className}`}
    >
      {children}
    </td>
  );
}

function Rank({ rank }) {
  const medal = MEDALS[rank];
  if (!medal) return <span className="pl-3 font-extrabold">#{String(rank).padStart(2, "0")}</span>;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border-2 bg-linear-to-b px-3 py-0.5 text-sm font-extrabold ${medal.className}`}>
      <Star small /> {medal.label}
    </span>
  );
}

// A coloured circle with the player icon; the colour is picked from the name, so it never changes
function Avatar({ name }) {
  const colour = AVATAR_COLOURS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLOURS.length];
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-white/80" style={{ backgroundColor: colour }} aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#0b1a3a">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0z" />
      </svg>
    </span>
  );
}

function LevelBadge({ levelId }) {
  const level = LEVELS.find((l) => l.id === levelId);
  if (!level) return <span className="text-[#cdeeff]">–</span>;
  return (
    <span className="inline-flex items-center gap-2 font-semibold">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: level.accent }} aria-hidden="true" />
      {level.name}
    </span>
  );
}

function Star({ small }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true">
      <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" fill="#ffc83d" stroke="#b07a00" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
