
import { useMemo } from "react";

export default function Bubbles({ count = 18 }) {
  // Random sizes and positions, made once so they don't jump on every re-render
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 6 + Math.random() * 26,
        left: Math.random() * 100,
        duration: 6 + Math.random() * 8,
        delay: -Math.random() * 14, // negative = already on the way up when the page opens
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute -bottom-10 rounded-full border-2 border-white/60 bg-white/15 animate-rise"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
