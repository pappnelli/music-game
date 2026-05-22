import { useEffect, useState } from "react";
import { SpotifyPlayerContext } from "./SpotifyPlayerContext";

export function SpotifyPlayerProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const accessToken = localStorage.getItem("spotify_access_token");

  useEffect(() => {
    if (!accessToken) return;

    function initPlayer() {
      const p = new window.Spotify.Player({
        name: "My Hitster Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.8,
      });

      p.addListener("ready", ({ device_id }) => {
        console.log("Spotify device ready:", device_id);
        setDeviceId(device_id);
      });

      p.addListener("not_ready", ({ device_id }) => {
        console.warn("Spotify device not ready:", device_id);
      });

      p.addListener("initialization_error", ({ message }) => {
        console.error("Spotify initialization error:", message);
      });

      p.addListener("authentication_error", ({ message }) => {
        console.error("Spotify authentication error:", message);
      });

      p.addListener("account_error", ({ message }) => {
        console.error("Spotify account error:", message);
      });

      p.connect();
      setPlayer(p);
    }

    // Ha a Spotify SDK még nem töltődött be → várunk rá
    console.log("****", window.Spotify);
    if (!window.Spotify) {
      const interval = setInterval(() => {
        if (window.Spotify) {
          clearInterval(interval);
          console.log("initPlayer 1");
          initPlayer();
        }
      }, 300);

      return () => clearInterval(interval);
    }

    // Ha már betöltődött → indítjuk
    console.log("initPlayer 2");
    initPlayer();
  }, [accessToken]);

  return <SpotifyPlayerContext.Provider value={{ player, deviceId }}>{children}</SpotifyPlayerContext.Provider>;
}
