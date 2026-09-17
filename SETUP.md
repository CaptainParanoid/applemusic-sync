# Setup checklist before sending this to Claudia

Everything below lives in `src/config.js` unless noted. Replace the
placeholders, then rebuild/redeploy.

- [x] **Birthday date + timezone** — `BIRTHDAY_ISO` is set to
  `2026-12-10T00:00:00+01:00` (Dec 10, Central European Time).
- [ ] **Stage 2 password** (`/login`, unlocks the minigame) — `STAGE2_PASSWORD`
  is still a placeholder.
- [ ] **Stage 4 password** (`/gift-login`, unlocks the gift reveal) —
  `STAGE4_PASSWORD` is still a placeholder.
- [ ] **Webhook / email provider**
  - `WEBHOOK_URL` in `src/config.js` is a placeholder — point it at your
    deployed `/api/send-win-email` route (or another webhook of your choice).
  - `api/send-win-email.js` needs a real email provider wired in (Resend or
    SendGrid both work) plus the real notify email address(es) and the
    real gift URL — see the TODOs at the top of that file.
- [x] **Minigame images** — real sprites for the falling cheese doodle and
  Claudia's cat are wired in via `src/assets/images/index.js`
  (`src/assets/images/cheese-doodle.png`, `src/assets/images/claudias-cat.png`).
- [ ] **Gift page hero photo** — `src/pages/GiftPage.jsx` still shows a
  placeholder block where the group's real photo should go (look for the
  `TODO(Tina)` comment).
- [ ] **Trip date options** — the three example date ranges on `/gift` are
  placeholders (`src/pages/GiftPage.jsx`, `EXAMPLE_DATE_RANGES`).

Once all boxes above are checked, do a final click-through of all four
stages before sending the link to Claudia.
