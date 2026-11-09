
export default function PlayerChip({ name, className = "" }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 rounded-full bg-[#0b1a3a] py-1 pl-1 pr-3 text-sm font-semibold text-white ${className}`}>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#4fd6ff] text-[#0b1a3a]" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0z" />
        </svg>
      </span>
      <span className="sr-only">Player: </span>
      <span className="max-w-[9rem] truncate sm:max-w-[14rem]">{name}</span>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#7ee8ff] shadow-[0_0_6px_#7ee8ff]" aria-hidden="true" />
    </span>
  );
}
