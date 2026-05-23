import { useEffect, useState } from "react";
import { SpotifyPlayerContext } from "./SpotifyPlayerContext";
import { useLocation } from "react-router-dom";

export function SpotifyPlayerProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("spotify_access_token"));

  // TOKEN FIGYELÉSE (storage event helyett interval)
  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = localStorage.getItem("spotify_access_token");
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [token]);

  // PLAYER INITIALIZÁLÁSA
  useEffect(() => {
    if (!token) return;

    if (player) {
      player.disconnect();
      setPlayer(null);
      setDeviceId(null);
    }

    function initPlayer() {
      const p = new window.Spotify.Player({
        name: "Music Game Player",
        getOAuthToken: (cb) => cb(token),
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
        // todo ha van játék folyamatban akkor jöjjön egy modal amivel be lehet újra jelentkezni ha nincs mentett játék akkor töröljük a localstoragebol amit kell
        console.error("Spotify authentication error:", message);

        /*console.log(isGamePage, "is game page");

        if (isGamePage) {
          //window.dispatchEvent(new CustomEvent("spotify-auth-expired"));
        } else {
          localStorage.removeItem("spotify_access_token");
          localStorage.removeItem("spotify_refresh_token");
          localStorage.removeItem("spotify_expires_in");
          localStorage.removeItem("spotify_token_timestamp");
          localStorage.removeItem("spotify_code_verifier");
        }*/
      });

      p.addListener("account_error", ({ message }) => {
        console.error("Spotify account error:", message);
      });

      p.connect();
      setPlayer(p);
    }

    if (!window.Spotify) {
      const interval = setInterval(() => {
        if (window.Spotify) {
          clearInterval(interval);
          initPlayer();
        }
      }, 300);

      return () => clearInterval(interval);
    }

    initPlayer();
  }, [token]);

  return <SpotifyPlayerContext.Provider value={{ player, deviceId }}>{children}</SpotifyPlayerContext.Provider>;
}
