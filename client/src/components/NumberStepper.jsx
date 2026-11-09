// A number box with − and + buttons (used in the puzzle popup).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { useId } from "react";

export default function NumberStepper({ label, tag, value, onChange, min = 0, max = 20, disabled }) {
  const id = useId();
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));

  return (
    <div className="rounded-2xl border-2 border-[#4fd6ff]/60 bg-[#0d4a8f]/70 p-3 sm:p-4">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="font-extrabold text-white sm:text-lg">{label}</label>
        <span className="text-[10px] font-bold tracking-wider text-[#9fe7ff]">{tag}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <StepButton label={`Less ${label}`} onClick={() => set((value ?? 0) - 1)} disabled={disabled}>−</StepButton>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ""}
          placeholder="e.g. 7"
          disabled={disabled}
          onChange={(e) => (e.target.value === "" ? onChange(null) : set(Number(e.target.value)))}
          className="h-12 min-w-0 flex-1 rounded-xl border-2 border-[#4fd6ff] bg-[#e9f6ff] text-center text-xl font-extrabold text-[#0b1a3a] outline-none placeholder:font-semibold placeholder:text-[#7f9bb8] focus:ring-4 focus:ring-[#4fd6ff]/40"
        />
        <StepButton label={`More ${label}`} onClick={() => set((value ?? 0) + 1)} disabled={disabled}>+</StepButton>
      </div>
      <p className="mt-1.5 text-center text-xs text-[#bfe9ff]">Range: {min} – {max}</p>
    </div>
  );
}

function StepButton({ children, label, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#4fd6ff] bg-[#1663b8] text-2xl font-extrabold text-white hover:bg-[#1d74d4] disabled:opacity-50"
      {...rest}
    >
      {children}
    </button>
  );
}
