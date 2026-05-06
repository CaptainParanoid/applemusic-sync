# Import the required modules 
import requests
import os 
from dotenv import load_dotenv

# Load the environmental variables 
load_dotenv()
developer_token = os.getenv("DEVELOPER_TOKEN")
music_user_token = os.getenv("MUSIC_USER_TOKEN")

headers = {
    "Authorization": f"Bearer {developer_token}",
    "Music-User-Token": music_user_token
}

# Get the playlist IDs for each playlist
destination_playlist_id = os.getenv("NUVARANDE_ID")
source_playlist_id = os.getenv("OCT2023_ID")

def get_all_tracks(playlist_id, headers): 
    """ A function to get all tracks in the playlists, as Apple Music only processes 100 at a time """
    tracks = []
    url = f"https://api.music.apple.com/v1/me/library/playlists/{playlist_id}/tracks"

    # Get the readable names for the playlists
    playlist_url = f"https://api.music.apple.com/v1/me/library/playlists/{playlist_id}"
    playlist_response = requests.get(playlist_url, headers=headers).json()
    
    for playlist in playlist_response['data']:
        playlist = playlist['attributes']['name']

    
    while url:
        response = requests.get(url, headers=headers).json()
        tracks.extend(response['data'])

        next_page = response.get("next")
        url = f"https://api.music.apple.com{next_page}" if next_page else None
        print(f"Processed {len(tracks)} tracks from {playlist}")

    return tracks

# Run the function to get all the tracks
tracks_destination = get_all_tracks(destination_playlist_id, headers)
tracks_source = get_all_tracks(source_playlist_id, headers)

# Create sets to get the track IDs 
track_ids_playlist_destination = {track['id'] for track in tracks_destination}
track_ids_playlist_source = {track['id'] for track in tracks_source}

print(f"Destination playlist: {len(track_ids_playlist_destination)} tracks.")
print(f"Source playlist: {len(track_ids_playlist_source)} tracks.")

# Do a set comparison and add songs that's in source but not in destination to a variable
tracks_to_sync = track_ids_playlist_source - track_ids_playlist_destination
print(f"{len(tracks_to_sync)} tracks to sync.")

# Creating a for loop to add songs that's in tracks_to_sync to destination playlist
for track in tracks_source:
    if track['id'] in tracks_to_sync:
        name = track['attributes']['name']
        artist = track['attributes']['artistName']

        response = requests.post(f"https://api.music.apple.com/v1/me/library/playlists/{destination_playlist_id}/tracks", 
                headers=headers,
                json={
                    "data": [{"id": track['id'], "type": "library-songs"}]
                }
        )
        
        if response.status_code == 204:
            print(f"Added {name} - {artist} to destination playlist.")

        else:
            print(f"Failed to sync {name} - {artist} - {response.status_code}")