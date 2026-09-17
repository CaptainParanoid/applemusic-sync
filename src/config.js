// ---------------------------------------------------------------------------
// Claudia's birthday surprise site — central config
//
// Everything Tina still needs to fill in before sending this to Claudia is
// marked with a TODO below. See SETUP.md at the repo root for the checklist.
// ---------------------------------------------------------------------------

// Claudia's birthday: December 10, Central European Time (CET, +01:00 in
// December — CEST/+02:00 only applies in summer, so this offset is correct).
export const BIRTHDAY_ISO = "2026-12-10T00:00:00+01:00";

// TODO(Tina): Replace with the real password for stage 2 (the minigame gate).
// This is checked client-side for now — see src/auth/checkPassword.js for
// notes on how to move this check to a server/API route later without
// changing the UI.
export const STAGE2_PASSWORD = "cheese123";

// TODO(Tina): Replace with the real password for stage 4 (the gift reveal).
export const STAGE4_PASSWORD = "portugal2027";

// Minigame: score needed to win.
export const WIN_SCORE = 15;

// TODO(Tina): Replace with the real webhook URL that should receive the
// "Claudia won the game!" notification (e.g. a Zapier/Make webhook, or the
// deployed `/api/send-win-email` route on this same site once it's live on
// Vercel, e.g. "https://your-site.vercel.app/api/send-win-email").
export const WEBHOOK_URL = "https://example.com/TODO-replace-with-real-webhook";

// localStorage keys used to remember that a stage's password gate has
// already been unlocked, so refreshing the page doesn't re-lock it.
export const STORAGE_KEYS = {
  stage2Unlocked: "claudia-birthday:stage2-unlocked",
  stage4Unlocked: "claudia-birthday:stage4-unlocked",
};
