# Claudia's birthday surprise 🎉

A little multi-stage birthday website built with React + Vite:

1. `/` — countdown to Claudia's birthday, auto-redirects to `/login` when it hits zero.
2. `/login` — password gate for stage 2.
3. `/game` — a minigame (catch the falling cheese doodles in the basket) that
   triggers a "win" notification when you reach the target score.
4. `/gift-login` → `/gift` — password gate + the final gift reveal.

See [`SETUP.md`](./SETUP.md) for the checklist of placeholder values (birthday,
passwords, webhook/email provider, photos) that need to be filled in before
sending this to Claudia. All of them live in `src/config.js`.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Build

```bash
npm run build
```

Output goes to `dist/`. `npm run preview` serves the built app locally.

## Deploy

This is set up for [Vercel](https://vercel.com):

1. Push this repo to GitHub (or import it directly) and create a new Vercel
   project pointing at it — Vercel auto-detects the Vite build.
2. The `api/send-win-email.js` file is a Vercel serverless function,
   automatically available at `/api/send-win-email` once deployed.
3. Add any email provider API key (see TODOs in `api/send-win-email.js`) as
   a Vercel environment variable before relying on real emails being sent.
