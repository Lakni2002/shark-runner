
import { useEffect, useRef, useState } from "react";
import PlayerChip from "./PlayerChip";

export default function TopNavbar({ active, playerName, onLevels, onLeaderboard, onLogout, soundOn, onToggleSound }) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  const links = [
    { key: "levels", icon: <PlayIcon />, label: "Levels", onClick: onLevels },
    { key: "leaderboard", icon: <TrophyIcon />, label: "Leaderboard", onClick: onLeaderboard },
    { key: "logout", icon: <LogoutIcon />, label: "Logout", onClick: onLogout },
  ];

  // Close the menu with the Escape key or a click outside the navbar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClickOutside = (e) => !headerRef.current?.contains(e.target) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClickOutside);
    };
  }, [open]);

  // Clicking a link: close the menu, then tell the page (nothing happens for the page you are on)
  const choose = (link) => {
    setOpen(false);
    if (link.key !== active) link.onClick?.();
  };

  const soundButton = onToggleSound && (
    <button
      type="button"
      onClick={onToggleSound}
      aria-label={soundOn ? "Mute sound" : "Turn sound on"}
      aria-pressed={!soundOn}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#0b1a3a] hover:bg-white/50"
    >
      <SoundIcon on={soundOn} />
    </button>
  );

  return (
    <header ref={headerRef} className="relative z-30 rounded-2xl bg-white/45 px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <img src="/assets/login/logo.png" alt="Shark Runner" className="h-9 w-auto shrink-0 sm:h-10" />

        {/* Player name (all screen sizes) */}
        {playerName && <PlayerChip name={playerName} />}

        {/* Laptop: buttons in a row */}
        <nav aria-label="Main" className="ml-auto hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavButton key={link.key} link={link} active={link.key === active} onClick={() => choose(link)} />
          ))}
          {soundButton}
        </nav>

        {/* Phone/tablet: ☰ button */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="main-menu"
          className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0b3f8f] text-white lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* Phone/tablet: drop-down menu */}
      {open && (
        <nav
          id="main-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full mt-2 flex flex-col gap-2 rounded-2xl border-2 border-[#4fd6ff] bg-[#0d4a8f]/95 p-3 shadow-2xl backdrop-blur-sm lg:hidden"
        >
          {playerName && (
            <p className="px-1 pb-1 text-sm font-semibold text-[#cdeeff]">
              Signed in as <span className="font-extrabold text-white">{playerName}</span>
            </p>
          )}
          {links.map((link) => (
            <NavButton key={link.key} link={link} active={link.key === active} onClick={() => choose(link)} wide />
          ))}
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              aria-pressed={!soundOn}
              className="flex w-full items-center gap-2 rounded-xl border-2 border-transparent bg-[#0b3f8f] px-4 py-3 font-bold text-white hover:bg-[#1663b8]"
            >
              <SoundIcon on={soundOn} />
              Sound: {soundOn ? "On" : "Off"}
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

function NavButton({ link, active, onClick, wide }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-xl border-2 font-bold text-white ${
        wide ? "w-full px-4 py-3 text-base" : "px-4 py-2 text-sm"
      } ${active ? "border-[#ffd34d] bg-[#1663b8]" : "border-transparent bg-[#0b3f8f] hover:bg-[#1663b8]"}`}
    >
      {link.icon}
      {link.label}
    </button>
  );
}

// ---------- Icons ----------
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M7 3h10v3h3v2a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V6h3zm0 5V8H6a2 2 0 0 0 1 1.7zm10 0v1.7A2 2 0 0 0 18 8z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />
    </svg>
  );
}

function SoundIcon({ on }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {on ? <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /> : <path d="M17 9l5 6M22 9l-5 6" />}
    </svg>
  );
}
