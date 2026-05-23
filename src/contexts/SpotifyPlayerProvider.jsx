// import { useEffect, useState } from "react";
// import { SpotifyPlayerContext } from "./SpotifyPlayerContext";

// export function SpotifyPlayerProvider({ children }) {
//   const [player, setPlayer] = useState(null);
//   const [deviceId, setDeviceId] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("spotify_access_token"));

//   // TOKEN FIGYELÉSE (storage event helyett interval)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const newToken = localStorage.getItem("spotify_access_token");
//       if (newToken !== token) {
//         setToken(newToken);
//       }
//     }, 300);

//     return () => clearInterval(interval);
//   }, [token]);

//   // PLAYER INITIALIZÁLÁSA
//   useEffect(() => {
//     if (!token) return;

//     if (player) {
//       player.disconnect();
//       setPlayer(null);
//       setDeviceId(null);
//     }

//     function initPlayer() {
//       const p = new window.Spotify.Player({
//         name: "Music Game Player",
//         getOAuthToken: (cb) => cb(token),
//         volume: 0.8,
//       });

//       p.addListener("ready", ({ device_id }) => {
//         console.log("Spotify device ready:", device_id);
//         setDeviceId(device_id);
//       });

//       p.addListener("not_ready", ({ device_id }) => {
//         console.warn("Spotify device not ready:", device_id);
//       });

//       p.addListener("initialization_error", ({ message }) => {
//         console.error("Spotify initialization error:", message);
//       });

//       p.addListener("authentication_error", ({ message }) => {
//         console.error("Spotify authentication error:", message);
//       });

//       p.addListener("account_error", ({ message }) => {
//         console.error("Spotify account error:", message);
//       });

//       p.connect();
//       setPlayer(p);
//     }

//     if (!window.Spotify) {
//       const interval = setInterval(() => {
//         if (window.Spotify) {
//           clearInterval(interval);
//           initPlayer();
//         }
//       }, 300);

//       return () => clearInterval(interval);
//     }

//     initPlayer();
//   }, [token]);

//   return <SpotifyPlayerContext.Provider value={{ player, deviceId }}>{children}</SpotifyPlayerContext.Provider>;
// }

import { useEffect, useState } from "react";
import { SpotifyPlayerContext } from "./SpotifyPlayerContext";

const TOKEN_KEY = "spotify_access_token";

export function SpotifyPlayerProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState(typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null);

  // 1) Token figyelése (polling, hogy callback után is biztosan frissüljön)
  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = localStorage.getItem(TOKEN_KEY);
      if (newToken !== token) {
        setToken(newToken);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [token]);

  // 2) Player lifecycle – MINDIG tiszta lappal indulunk tokenváltáskor
  useEffect(() => {
    if (!token) {
      // nincs token → biztosan ne legyen player / deviceId
      if (player) {
        player.disconnect();
      }
      // setPlayer(null);
      // setDeviceId(null);
      Promise.resolve().then(() => {
        setPlayer(null);
        setDeviceId(null);
      });
      return;
    }

    let spotifyPlayer = null;
    let sdkInterval = null;
    let cancelled = false;

    async function destroyOldPlayerIfAny() {
      if (player) {
        try {
          await player.disconnect();
        } catch (e) {
          console.warn("Error disconnecting old Spotify player", e);
        }
      }
      setPlayer(null);
      setDeviceId(null);
      // kis várakozás, hogy a Spotify szerver tényleg elengedje a deviceId-t
      await new Promise((res) => setTimeout(res, 500));
    }

    async function initPlayer() {
      await destroyOldPlayerIfAny();
      if (cancelled) return;

      spotifyPlayer = new window.Spotify.Player({
        name: "Music Game Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Spotify device ready:", device_id);
        if (!cancelled) {
          setDeviceId(device_id);
        }
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.warn("Spotify device not ready:", device_id);
      });

      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Spotify initialization error:", message);
      });

      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("Spotify authentication error:", message);
      });

      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("Spotify account error:", message);
      });

      try {
        const ok = await spotifyPlayer.connect();
        if (ok && !cancelled) {
          setPlayer(spotifyPlayer);
        } else {
          console.error("Spotify player failed to connect");
        }
      } catch (e) {
        console.error("Error connecting Spotify player", e);
      }
    }

    // Várjuk az SDK-t, ha még nincs bent
    function waitForSDKAndInit() {
      if (window.Spotify && window.Spotify.Player) {
        initPlayer();
        return;
      }

      sdkInterval = setInterval(() => {
        if (window.Spotify && window.Spotify.Player) {
          clearInterval(sdkInterval);
          initPlayer();
        }
      }, 300);
    }

    waitForSDKAndInit();

    // cleanup – tab bezárás / tokenváltás / unmount
    return () => {
      cancelled = true;
      if (sdkInterval) clearInterval(sdkInterval);
      if (spotifyPlayer) {
        spotifyPlayer.disconnect();
      }
    };
  }, [token, player]); // token váltás = teljes újrakezdés

  return <SpotifyPlayerContext.Provider value={{ player, deviceId }}>{children}</SpotifyPlayerContext.Provider>;
}
