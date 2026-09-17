import { WEBHOOK_URL } from "../config.js";

// ---------------------------------------------------------------------------
// sendWinEmail — called once when Claudia reaches WIN_SCORE in the minigame.
//
// This is a stub: it just POSTs a small JSON payload to WEBHOOK_URL. In
// production, WEBHOOK_URL should point at the deployed `/api/send-win-email`
// serverless function in this repo (see api/send-win-email.js), which
// actually sends the "you won!" email via a real email provider.
//
// TODO(Tina): once deployed, set WEBHOOK_URL in src/config.js to your site's
// own `/api/send-win-email` URL (or to any other webhook you'd rather use).
// ---------------------------------------------------------------------------
export async function sendWinEmail({ score } = {}) {
  const payload = {
    event: "claudia-birthday-game-won",
    score,
    winScore: score,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Don't block the "You did it!" screen on a failed webhook — this is
      // a nice-to-have notification, not a critical path for the surprise.
      console.warn("sendWinEmail: webhook responded with", response.status);
      return { ok: false, status: response.status };
    }

    return { ok: true };
  } catch (err) {
    console.warn("sendWinEmail: failed to reach webhook", err);
    return { ok: false, error: String(err) };
  }
}
