# Simple Docker setup for local testing of the birthday site.
# Builds the static Vite site, then serves it with `serve -s` so that
# refreshing routes like /login, /game, /gift works (SPA fallback to
# index.html for unknown paths, handled client-side by React Router).
#
# Note: this only serves the frontend. The api/send-win-email.js serverless
# function is Vercel-specific and is NOT run by this container — see
# README.md for notes on testing that separately (e.g. `vercel dev`).

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
