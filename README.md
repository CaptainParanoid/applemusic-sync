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
