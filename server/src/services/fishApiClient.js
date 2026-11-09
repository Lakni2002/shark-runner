// fishApiClient: the ONLY file that talks to the Fish Game API (interoperability).
// If the API changes (new URL, new JSON format), only this file needs to change.
// Fish Game API by Marc Conrad: http://marcconrad.com/uob/fish/doc.php
// Parts of this file were written with help from Claude (AI), then reviewed and modified by me.

// The URL can be changed without touching code (e.g. for testing): set FISH_API_URL
const FISH_API_URL = process.env.FISH_API_URL || "http://marcconrad.com/uob/fish/api.php";
const TIMEOUT_MS = 8000; // don't let a slow API freeze the game

// Get a new puzzle: { image (data URL), fish, chests }
export async function fetchPuzzle() {
  // 1. Ask the API for a puzzle in JSON format
  const res = await fetch(`${FISH_API_URL}?out=json`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Fish API replied with status ${res.status}`);
  const data = await res.json(); // e.g. { question: "https://…/ch_…_007x004.png", fish: 4, chest: 7 }

  // 2. Check the reply has what we expect (never trust data from another system blindly)
  const fish = Number(data.fish);
  const chests = Number(data.chest ?? data.chests);
  if (typeof data.question !== "string" || !Number.isInteger(fish) || !Number.isInteger(chests)) {
    throw new Error("Unexpected reply from the Fish API");
  }

  // 3. Turn the picture into a data URL.
  //    We do NOT send the API's image link to the browser: the file name contains the answers
  //    (…_007x004.png = 7 chests, 4 fish), so a player could read it and cheat.
  const image = data.question.startsWith("http")
    ? await downloadAsDataUrl(data.question)
    : `data:image/png;base64,${data.question}`; // the API's base64 option sends the picture itself

  return { image, fish, chests };
}

async function downloadAsDataUrl(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Puzzle image replied with status ${res.status}`);
  const type = res.headers.get("content-type") || "image/png";
  const bytes = Buffer.from(await res.arrayBuffer());
  return `data:${type};base64,${bytes.toString("base64")}`;
}
