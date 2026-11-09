
import { useEffect } from "react";
import GameButton from "../components/GameButton";
import Bubbles from "../components/Bubbles";

export default function WelcomePage({ onStart }) {
  // Keyboard EVENT: Enter also starts the game
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") onStart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey); // clean up when the page closes
  }, [onStart]);

  return (
    <main className="relative h-dvh overflow-hidden bg-[#1b8fd6]">
      {/* Background art fills the screen on any size (sides are cropped on phones) */}
      <img
        src="/assets/welcome/background.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />

      <Bubbles count={20} />

      {/* Content, centred */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-[6vh]">
        <h1 className="animate-drop-in">
          <img
            src="/assets/welcome/logo.png"
            alt="Shark Runner"
            className="w-[min(78vw,480px)] drop-shadow-[0_6px_0_rgba(10,40,80,0.35)]"
          />
        </h1>

        <img
          src="/assets/welcome/shark.png"
          alt=""
          className="-mt-[2vh] w-[min(62vw,380px)] animate-float"
        />

        <div className="mt-[4vh] animate-pop-in">
          <GameButton onClick={onStart}>START</GameButton>
        </div>
      </div>
    </main>
  );
}
