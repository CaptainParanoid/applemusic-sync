// ---------------------------------------------------------------------------
// Password check for the stage gates (/login and /gift-login).
//
// This runs entirely client-side today, which is fine for a lighthearted
// birthday surprise (the "secret" only needs to survive casual guessing,
// not a determined attacker). It's isolated in this one function so it can
// later be swapped for a real server-side check (e.g. POST to a small API
// route that verifies the password and returns a signed token) without
// touching the page components that call it.
// ---------------------------------------------------------------------------
export async function checkPassword(inputPassword, expectedPassword) {
  // TODO(future): replace with a call to a server-side auth endpoint, e.g.
  //   const res = await fetch("/api/check-password", { method: "POST", ... });
  //   return res.ok;
  return inputPassword.trim() === expectedPassword;
}

export function isUnlocked(storageKey) {
  return localStorage.getItem(storageKey) === "true";
}

export function setUnlocked(storageKey) {
  localStorage.setItem(storageKey, "true");
}
