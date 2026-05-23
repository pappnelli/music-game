import { Play } from "lucide-react";
import { useSpotifyPlayer } from "../../contexts/useSpotifyPlayer";
import Button from "../../ui/Button";
import { startSpotifyPlayback } from "../../utils/spotifyPlayback";

function extractTrackId(url) {
  if (!url) return null;
  const match = url.match(/track\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export default function StartMusicButton({ currentSong, accessToken }) {
  const { deviceId } = useSpotifyPlayer();
  const trackId = extractTrackId(currentSong?.spotify_url);

  /*async function startSpotifyPlayback() {
    if (!deviceId) {
      console.warn("Spotify device not ready yet");
      return;
    }

    if (!trackId) {
      console.error("Invalid Spotify track URL:", currentSong.spotify_url);
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
  }*/

  async function handlePlay() {
    await startSpotifyPlayback({
      deviceId,
      trackId,
      accessToken,
    });
  }

  // return (
  //   <div className="qr-code">
  //     <Button disabled={!deviceId || !trackId} onClick={startSpotifyPlayback}>
  //       Start music
  //     </Button>
  //   </div>
  // );

  return (
    <Button disabled={!deviceId || !trackId} onClick={handlePlay} className="icon-button" style={{ width: "fit-content" }}>
      <Play size={16} />
    </Button>
  );
}
