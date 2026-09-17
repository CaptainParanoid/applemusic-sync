# Apple Music Sync

A script that automatically syncs track from one of my Apple Music playlists to another. Runs daily via Github Actions and then sends a summary notification via [ntfy](https://ntfy.sh).

## What it does

1. Fetches all tracks from a source playlist and a destination playlist
2. Compares them and finds tracks that are in the source but not the destination
3. Adds the missing tracks to the destination playlist
4. Sends a notification with the results

## GitHub Actions

The sync runs automatically at 21:00 UTC every day.

Required repository secrets: `DEVELOPER_TOKEN`, `MUSIC_USER_TOKEN`, `DESTINATION_PLAYLIST_ID`, `SOURCE_PLAYLIST_ID`, `WEBHOOK_URL`.

## Content-based recommender (`Scripts/recommend.py`)

A small, from-scratch music recommendation algorithm built on top of the same Apple
Music API access used by the sync script. It reads one of your real playlists and
suggests new songs — no external dataset, no black-box ML model, no Spotify audio
features (that endpoint was shut down for new apps in Nov 2024, and Apple Music
never exposed one publicly either).

### How the algorithm works

1. **Read your playlist.** Pulls every track from `SOURCE_PLAYLIST_ID` via the
   Library API (`/v1/me/library/playlists/{id}/tracks`), same as `sync_playlists.py`.
2. **Build a taste profile.** Counts how often each artist and genre appears in the
   playlist. No training — just counting what you already like.
3. **Pick seed artists.** Takes your top N most-listened-to artists.
4. **Expand with Apple's own similarity graph.** For each seed artist, calls the
   catalog API with `?views=similar-artists,top-songs` to get artists Apple already
   considers similar, plus each artist's most popular songs. This graph traversal
   *is* the "content" signal, since we don't have per-song audio features to compare.
5. **Score every candidate song:**

   ```
   score = (listens of the seed artist in your library) * WEIGHT_ARTIST_FAMILIARITY
          + (genres shared with your top genres)         * WEIGHT_GENRE_OVERLAP
   ```

6. **Filter and rank.** Drops songs you already own and prints the top-scoring
   candidates along with a plain-English reason each one was picked.

Every step is simple counting/arithmetic on purpose, so you can trace exactly why a
song was recommended. The weights and limits are constants at the top of the file —
tweak them and re-run to see how recommendations change; that's the fastest way to
build intuition for how content-based recommenders behave.

### Running it

```bash
pip install -r requirements.txt
cp .env.example .env   # fill in DEVELOPER_TOKEN, MUSIC_USER_TOKEN, SOURCE_PLAYLIST_ID
python Scripts/recommend.py
```

### Ideas to extend it (once the basics click)

- Weight recently-added tracks more heavily so your profile reflects current taste.
- Add a diversity cap (e.g. max 2 recommendations per artist) so one prolific seed
  doesn't dominate the results.
- Swap genre-overlap for release-year/decade overlap, or combine both.
- Replace the hand-picked weights with a small logistic regression trained on
  thumbs-up/thumbs-down feedback you give the recommendations yourself.
