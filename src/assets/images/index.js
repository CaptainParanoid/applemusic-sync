// ---------------------------------------------------------------------------
// Image config map for the minigame (and any other art assets).
//
// Drop real files into this folder and point the matching entry below at
// them — nothing else in the game code needs to change. If an entry is
// `null`, the game falls back to a placeholder emoji/shape automatically.
// ---------------------------------------------------------------------------

import cheeseDoodleImg from "./cheese-doodle.png";
import claudiasCatImg from "./claudias-cat.png";

export const GAME_IMAGES = {
  // Falling item the cat catches in the basket.
  doodle: cheeseDoodleImg,
  // The cat / basket sprite the player moves left-right.
  cat: claudiasCatImg,
};

// Placeholder fallbacks, used only if an entry above is null/missing.
export const PLACEHOLDER_EMOJI = {
  doodle: "🧀",
  cat: "🐱",
};
