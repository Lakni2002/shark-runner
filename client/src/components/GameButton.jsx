

const FACES = {
  green: "from-[#86d37a] to-[#3f8f45] border-[#2f5a2c] [text-shadow:0_3px_0_#1f3b1d]",
  blue: "from-[#6fd6f2] to-[#2a86c4] border-[#1d4f7a] [text-shadow:0_3px_0_#123552]",
  orange: "from-[#ffc65c] to-[#f08a24] border-[#8a4a12] [text-shadow:0_3px_0_#5c2f08]",
};

export default function GameButton({ children, onClick, color = "green", size = "lg", className = "", ...rest }) {
  const text = size === "lg" ? "text-3xl sm:text-4xl px-10 sm:px-14 py-2" : "text-xl px-6 py-1.5";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl bg-[#7a4a24] p-1.5 shadow-[0_6px_0_#3d2410] transition-transform
        hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_2px_0_#3d2410]
        focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-aqua ${className}`}
      {...rest}
    >
      <span
        className={`block rounded-xl border-4 bg-linear-to-b font-game tracking-wide text-white ${FACES[color]} ${text}`}
      >
        {children}
      </span>
    </button>
  );
}
