// Fish API puzzle popup, used for the Treasure Chest AND the Second Chance.
// It loads a puzzle through puzzleService, runs the 15-second countdown, sends the answer,
// shows the result, then reports { correct } to the game page through onDone.
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.
import { useCallback, useEffect, useRef, useState } from "react";
import { getPuzzle, checkAnswer } from "../api/puzzleService";
import NumberStepper from "./NumberStepper";

const MODES = {
  treasure: {
    title: "Treasure Chest",
    titleAccent: "Puzzle!",
    rewardText: "Correct: +50 points and slower speed",
    wrongText: "Wrong: no bonus",
    canSkip: true,
    border: "border-[#f5c451]",
  },
  "second-chance": {
    title: "Second Chance",
    titleAccent: "Puzzle!",
    rewardText: "Correct: +1 life, keep swimming",
    wrongText: "Wrong: game over",
    canSkip: false,
    border: "border-[#ff8a5b]",
  },
};

export default function PuzzlePopup({ mode, onDone }) {
  const info = MODES[mode];
  const [puzzle, setPuzzle] = useState(null); // { image, timeLimit }
  const [loadError, setLoadError] = useState("");
  const [fish, setFish] = useState(null);
  const [chests, setChests] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [result, setResult] = useState(null); // { correct, timedOut, answer }
  const [sending, setSending] = useState(false);
  const submittedRef = useRef(false);

  // Load a puzzle from the server (which gets it from the Fish API)
  const load = useCallback(() => {
    setLoadError("");
    setPuzzle(null);
    getPuzzle()
      .then((p) => {
        setPuzzle(p);
        setSecondsLeft(p.timeLimit);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  // Load once when the popup opens. (React's StrictMode runs effects twice while developing –
  // the ref stops a second puzzle replacing the first, which would mix up the saved answer.)
  const startedRef = useRef(false);
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    load();
  }, [load]);

  // Send the answer (also used when time runs out)
  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSending(true);
    try {
      setResult(await checkAnswer(fish ?? -1, chests ?? -1));
    } catch (err) {
      setResult({ correct: false, error: err.message });
    } finally {
      setSending(false);
    }
  }, [fish, chests]);

  // Countdown TIMER EVENT: one tick per second; at 0 the answer is sent automatically
  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      submit();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, result, submit]);

  const finish = (correct) => onDone({ mode, correct });

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#04203f]/70 p-3 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="puzzle-title">
      <div className={`relative w-full max-w-[640px] rounded-3xl border-4 ${info.border} bg-linear-to-b from-[#1b6fc2] to-[#0d4a8f] p-4 text-white shadow-2xl sm:p-6`}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <ChestIcon mode={mode} />
          <div className="min-w-0 flex-1">
            <h2 id="puzzle-title" className="font-game text-2xl leading-tight sm:text-3xl">
              {info.title} <span className="text-[#ffd34d]">{info.titleAccent}</span>
            </h2>
            <p className="text-sm text-[#cdeeff]">Count the fish and treasure chests in the picture.</p>
          </div>
          {!result && secondsLeft !== null && (
            <div className={`rounded-xl border-2 px-3 py-1 text-center ${secondsLeft <= 5 ? "border-[#ff8a5b] animate-pulse" : "border-[#4fd6ff]"}`}>
              <div className="font-game text-xl" aria-live="polite">00:{String(secondsLeft).padStart(2, "0")}</div>
              <div className="text-[9px] font-bold tracking-wider text-[#bfe9ff]">TIME LEFT</div>
            </div>
          )}
          {info.canSkip && !result && (
            <button type="button" onClick={() => finish(false)} aria-label="Close puzzle" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-white bg-[#1663b8] text-xl font-bold hover:bg-[#1d74d4]">
              ✕
            </button>
          )}
        </div>

        {/* Puzzle picture from the Fish API */}
        <div className="mt-4 grid h-48 place-items-center overflow-hidden rounded-2xl border-2 border-[#4fd6ff] bg-[#0a3d75] sm:h-64">
          {puzzle && <img src={puzzle.image} alt="Puzzle: fish and treasure chests to count" className="h-full w-full object-contain" />}
          {!puzzle && !loadError && <p className="animate-pulse font-semibold text-[#cdeeff]">Fetching a puzzle from the deep…</p>}
          {loadError && (
            <div className="px-4 text-center">
              <p className="font-semibold">{loadError}</p>
              <div className="mt-3 flex justify-center gap-2">
                <button type="button" onClick={load} className="rounded-xl bg-[#4fd6ff] px-4 py-2 font-bold text-[#0b1a3a]">Try again</button>
                <button type="button" onClick={() => finish(false)} className="rounded-xl border-2 border-white px-4 py-2 font-bold">
                  {mode === "treasure" ? "Continue without bonus" : "End game"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Answer boxes OR the result */}
        {!result ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <NumberStepper label="How many fish?" tag="TARGET_A" value={fish} onChange={setFish} disabled={!puzzle || sending} />
              <NumberStepper label="How many chests?" tag="TARGET_B" value={chests} onChange={setChests} disabled={!puzzle || sending} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-2xl border-2 border-[#4fd6ff]/50 bg-[#0a3d75]/60 px-4 py-2 text-sm font-semibold">
              <span className="flex items-center gap-2"><Dot ok /> {info.rewardText}</span>
              <span className="flex items-center gap-2"><Dot /> {info.wrongText}</span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              {info.canSkip ? (
                <button type="button" onClick={() => finish(false)} className="rounded-xl border-2 border-[#4fd6ff] px-5 py-2.5 font-bold hover:bg-white/10">
                  Skip puzzle →
                </button>
              ) : (
                <span className="text-sm text-[#ffd1c2]">Wrong answer or no answer = game over</span>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={!puzzle || sending || fish === null || chests === null}
                className="rounded-2xl border-4 border-[#c77a12] bg-linear-to-b from-[#ffd36a] to-[#f5a524] px-6 py-2.5 font-game text-xl text-white [text-shadow:0_2px_0_#8a4a12] shadow-[0_4px_0_rgba(0,0,0,0.3)] disabled:opacity-60"
              >
                {sending ? "Checking…" : "Submit answer"}
              </button>
            </div>
          </>
        ) : (
          <ResultView result={result} mode={mode} onContinue={() => finish(result.correct)} />
        )}
      </div>
    </div>
  );
}

function ResultView({ result, mode, onContinue }) {
  const { correct, timedOut, answer, error } = result;
  let message;
  if (correct) message = mode === "treasure" ? "Treasure unlocked! +50 points and the river slows down." : "Your shark is back with 1 life!";
  else if (error) message = error;
  else message = `${timedOut ? "Time's up!" : "Not quite!"} It was ${answer.fish} fish and ${answer.chests} chests.`;

  return (
    <div className="mt-4 flex flex-col items-center gap-3 text-center" role="status">
      <div className={`grid h-14 w-14 place-items-center rounded-full text-3xl font-bold ${correct ? "bg-[#2fc24a]" : "bg-[#ff5b4a]"}`} aria-hidden="true">
        {correct ? "✓" : "✕"}
      </div>
      <p className="font-game text-2xl">{correct ? "Correct!" : "Wrong answer"}</p>
      <p className="text-[#cdeeff]">{message}</p>
      <button type="button" onClick={onContinue} autoFocus className="mt-1 rounded-2xl border-4 border-[#1f8a2e] bg-linear-to-b from-[#5ee35b] to-[#25b23a] px-8 py-2.5 font-game text-xl [text-shadow:0_2px_0_#0f5a1a]">
        {correct || mode === "treasure" ? "Keep swimming" : "See results"}
      </button>
    </div>
  );
}

function Dot({ ok }) {
  return (
    <span className={`grid h-5 w-5 place-items-center rounded-full text-xs font-bold ${ok ? "bg-[#2fc24a]" : "bg-[#ff5b4a]"}`} aria-hidden="true">
      {ok ? "✓" : "✕"}
    </span>
  );
}

function ChestIcon({ mode }) {
  if (mode === "second-chance") {
    return (
      <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden="true">
        <path d="M24 42S6 31 6 18a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 13-18 24-18 24z" fill="#ff5b6e" stroke="#7a1022" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" aria-hidden="true">
      <rect x="5" y="20" width="38" height="22" rx="3" fill="#a0612b" stroke="#4a2a10" strokeWidth="3" />
      <path d="M5 22v-6a9 9 0 0 1 9-9h20a9 9 0 0 1 9 9v6z" fill="#c27a35" stroke="#4a2a10" strokeWidth="3" />
      <rect x="21" y="7" width="6" height="35" fill="#f5c451" />
      <rect x="19" y="20" width="10" height="9" rx="2" fill="#f5c451" stroke="#4a2a10" strokeWidth="2" />
    </svg>
  );
}
