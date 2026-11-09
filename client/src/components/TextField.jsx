// Reusable labelled input (used on the login and register forms).
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { useId } from "react";

export default function TextField({ label, type = "text", value, onChange, error, ...rest }) {
  const id = useId(); // unique id so the <label> is linked to its <input>

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-semibold text-slate-900">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`h-11 rounded-lg border bg-white px-3 text-slate-900 outline-none transition
          focus:border-[#4f5bf5] focus:ring-4 focus:ring-[#4f5bf5]/20
          ${error ? "border-red-500" : "border-slate-400"}`}
        {...rest}
      />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
