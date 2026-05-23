// src/utils/spotifyPlayback.js

export async function startSpotifyPlayback({ deviceId, trackId, accessToken }) {
  if (!deviceId) {
    console.warn("Spotify device not ready yet");
    return;
  }

  if (!trackId) {
    console.error("Invalid Spotify track ID");
    return;
  }

  try {
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
      }),
    });
  } catch (err) {
    console.error("Failed to start Spotify playback:", err);
  }
}
