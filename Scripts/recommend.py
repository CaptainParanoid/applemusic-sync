"""
A content-based music recommender built on top of your own Apple Music library.

WHY CONTENT-BASED?
Spotify's audio-features endpoint (danceability/energy/valence/etc.) was shut down
for new apps in November 2024, and Apple Music never exposed anything like it
publicly. So instead of comparing songs by their *sound*, we compare them by their
*metadata*: genres and artists. That's what "content-based filtering" means here -
we recommend songs whose content (genre tags, and the artist behind them) matches
the content you already listen to.

THE ALGORITHM (read this before the code - it's the whole idea):
1.  Pull every track from one of your Apple Music playlists. This is your ground
    truth: it tells us what you actually like.
2.  Count how often each artist and each genre shows up in that playlist. This is
    your "taste profile" - no training, no model weights, just counts.
3.  Take your top N most-listened-to artists as "seeds". For each seed, ask Apple
    Music's catalog API for artists it already considers similar (Apple computes
    this relationship for us - we don't have to), plus that seed's most popular
    songs.
4.  Every song we find this way is a "candidate" recommendation. We score each
    candidate with a simple weighted formula:

        score = (how much you like the seed artist) * WEIGHT_ARTIST_FAMILIARITY
              + (genres it shares with your top genres) * WEIGHT_GENRE_OVERLAP

5.  Drop anything you already own, sort candidates by score, print the top results
    along with *why* each one was picked.

Because every step is just counting and arithmetic, you can read top to bottom and
know exactly why a song was recommended - unlike a black-box model. Tweak the
WEIGHTS/limits below and re-run to see how the recommendations shift; that's the
fastest way to build intuition for how real recommenders behave.

Required environment variables (same auth as sync_playlists.py):
    DEVELOPER_TOKEN       - Apple Music developer JWT (see jwt_token_generate.py)
    MUSIC_USER_TOKEN      - token identifying your Apple Music account/library
    SOURCE_PLAYLIST_ID    - the library playlist ID to build your taste profile from
"""

import os
import sys
from collections import Counter

import requests
from dotenv import load_dotenv

load_dotenv()

DEVELOPER_TOKEN = os.getenv("DEVELOPER_TOKEN")
MUSIC_USER_TOKEN = os.getenv("MUSIC_USER_TOKEN")
SOURCE_PLAYLIST_ID = os.getenv("SOURCE_PLAYLIST_ID")

# --- Tunable knobs. Change these and re-run to see how results change. --------
TOP_ARTISTS_TO_EXPLORE = 15        # how many of your favourite artists to use as seeds
SIMILAR_ARTISTS_PER_SEED = 5       # how many "similar artists" Apple gives us per seed
TOP_SONGS_PER_ARTIST = 5           # how many popular songs to pull per candidate artist
TOP_GENRES_CONSIDERED = 10         # how many of your top genres count toward scoring
RECOMMENDATIONS_TO_SHOW = 20

WEIGHT_ARTIST_FAMILIARITY = 1.0    # reward per song you own by the seed artist
WEIGHT_GENRE_OVERLAP = 0.5         # reward per genre a candidate shares with your taste
# --------------------------------------------------------------------------------

API_ROOT = "https://api.music.apple.com/v1"

HEADERS = {
    "Authorization": f"Bearer {DEVELOPER_TOKEN}",
    "Music-User-Token": MUSIC_USER_TOKEN,
}


def api_get(url, params=None):
    """A tiny wrapper so a bad/expired token gives you a clear error instead of a
    confusing KeyError three functions later."""
    response = requests.get(url, headers=HEADERS, params=params)
    if response.status_code != 200:
        sys.exit(
            f"Apple Music API request failed ({response.status_code}) for {url}\n"
            f"{response.text[:500]}"
        )
    return response.json()


def get_storefront():
    """Apple Music's catalog is split per country ('storefront', e.g. 'us', 'gb').
    We ask the API which one applies to you instead of hardcoding one."""
    data = api_get(f"{API_ROOT}/me/storefront")
    return data["data"][0]["id"]


def get_playlist_tracks(playlist_id):
    """Fetch every track in a library playlist, 100 at a time (Apple Music's page
    size), following the 'next' link until it runs out."""
    tracks = []
    url = f"{API_ROOT}/me/library/playlists/{playlist_id}/tracks"

    while url:
        response = api_get(url)
        tracks.extend(response.get("data", []))
        next_page = response.get("next")
        url = f"https://api.music.apple.com{next_page}" if next_page else None

    return tracks


def build_taste_profile(tracks):
    """Turn raw track objects into simple frequency counts. This *is* the model:
    no training, just counting what you already like."""
    artist_counts = Counter()
    genre_counts = Counter()
    known_track_keys = set()  # (name, artist) pairs you already own

    for track in tracks:
        attrs = track.get("attributes", {})
        artist = attrs.get("artistName")
        name = attrs.get("name")

        if artist:
            artist_counts[artist] += 1
        for genre in attrs.get("genreNames", []):
            genre_counts[genre] += 1
        if name and artist:
            known_track_keys.add((name.lower(), artist.lower()))

    return artist_counts, genre_counts, known_track_keys


def search_artist_id(name, storefront):
    """The library API gives us artist *names*, not catalog artist IDs, so we look
    each seed artist up by name in the catalog search endpoint."""
    response = api_get(
        f"{API_ROOT}/catalog/{storefront}/search",
        params={"term": name, "types": "artists", "limit": 1},
    )
    results = response.get("results", {}).get("artists", {}).get("data", [])
    return results[0]["id"] if results else None


def get_similar_artists_and_top_songs(artist_id, storefront):
    """Apple Music computes a 'similar-artists' relationship for every catalog
    artist - this is the core signal our recommender leans on, since Apple Music
    doesn't expose audio features (tempo/energy/etc.) the way Spotify used to."""
    response = api_get(
        f"{API_ROOT}/catalog/{storefront}/artists/{artist_id}",
        params={"views": "similar-artists,top-songs"},
    )
    data = response.get("data", [])
    if not data:
        return [], []

    views = data[0].get("views", {})
    similar_artists = views.get("similar-artists", {}).get("data", [])[:SIMILAR_ARTISTS_PER_SEED]
    top_songs = views.get("top-songs", {}).get("data", [])[:TOP_SONGS_PER_ARTIST]
    return similar_artists, top_songs


def score_candidate_songs(songs, candidates, known_track_keys, top_genres, seed_artist_name, listen_count):
    """Score a batch of candidate songs and merge them into the shared `candidates`
    dict, keeping the highest-scoring reason if a song is reachable multiple ways."""
    for song in songs:
        attrs = song.get("attributes", {})
        name = attrs.get("name")
        artist = attrs.get("artistName")
        genres = set(attrs.get("genreNames", []))

        if not name or not artist:
            continue
        if (name.lower(), artist.lower()) in known_track_keys:
            continue  # you already have this one

        genre_overlap = len(genres & top_genres)
        score = (WEIGHT_ARTIST_FAMILIARITY * listen_count) + (WEIGHT_GENRE_OVERLAP * genre_overlap)

        existing = candidates.get(song["id"])
        if existing and existing["score"] >= score:
            continue  # keep the best-scoring path we've already found for this song

        candidates[song["id"]] = {
            "song": {"name": name, "artistName": artist},
            "score": score,
            "reason": (
                f"similar to {seed_artist_name} ({listen_count} song(s) of theirs in your playlist), "
                f"shares {genre_overlap} genre(s) with your top genres"
            ),
        }


def main():
    if not DEVELOPER_TOKEN or not MUSIC_USER_TOKEN:
        sys.exit("Missing DEVELOPER_TOKEN or MUSIC_USER_TOKEN - check your .env file.")
    if not SOURCE_PLAYLIST_ID:
        sys.exit(
            "Missing SOURCE_PLAYLIST_ID - set it in .env to the Apple Music "
            "playlist you want recommendations based on."
        )

    print("Fetching your playlist from Apple Music...")
    tracks = get_playlist_tracks(SOURCE_PLAYLIST_ID)
    print(f"Loaded {len(tracks)} tracks.")
    if not tracks:
        sys.exit("That playlist has no tracks - nothing to build a taste profile from.")

    artist_counts, genre_counts, known_track_keys = build_taste_profile(tracks)
    top_genres = {genre for genre, _ in genre_counts.most_common(TOP_GENRES_CONSIDERED)}
    top_artists = artist_counts.most_common(TOP_ARTISTS_TO_EXPLORE)

    print(f"Your top genres: {', '.join(top_genres) or '(none found)'}")
    print(f"Exploring {len(top_artists)} of your favourite artists as recommendation seeds...\n")

    storefront = get_storefront()
    candidates = {}

    for seed_artist_name, listen_count in top_artists:
        seed_artist_id = search_artist_id(seed_artist_name, storefront)
        if not seed_artist_id:
            print(f"  (couldn't find '{seed_artist_name}' in the catalog, skipping)")
            continue

        similar_artists, direct_top_songs = get_similar_artists_and_top_songs(seed_artist_id, storefront)
        print(f"  {seed_artist_name}: found {len(similar_artists)} similar artist(s)")

        # Recommend more songs by an artist you already love.
        score_candidate_songs(
            direct_top_songs, candidates, known_track_keys, top_genres, seed_artist_name, listen_count
        )

        # Recommend songs by artists similar to one you love.
        for similar_artist in similar_artists:
            _, similar_top_songs = get_similar_artists_and_top_songs(similar_artist["id"], storefront)
            score_candidate_songs(
                similar_top_songs, candidates, known_track_keys, top_genres, seed_artist_name, listen_count
            )

    ranked = sorted(candidates.values(), key=lambda c: c["score"], reverse=True)

    print(f"\nTop {RECOMMENDATIONS_TO_SHOW} recommendations:\n")
    if not ranked:
        print("No recommendations found - try a bigger playlist or loosen the limits above.")
        return

    for entry in ranked[:RECOMMENDATIONS_TO_SHOW]:
        song = entry["song"]
        print(f"{song['name']} - {song['artistName']}  (score: {entry['score']:.2f})")
        print(f"    why: {entry['reason']}")


if __name__ == "__main__":
    main()
