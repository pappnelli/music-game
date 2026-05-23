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
import { useEffect, useState, useRef } from "react";
import { SpotifyPlayerContext } from "./SpotifyPlayerContext";

export function SpotifyPlayerProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("spotify_access_token"));

  // 🔒 Token változás guard
  const prevTokenRef = useRef(null);

  // TOKEN FIGYELÉSE (storage event helyett interval)
  useEffect(() => {
    const interval = setInterval(() => {
      const newToken = localStorage.getItem("spotify_access_token");
      if (newToken && newToken !== token) {
        setToken(newToken);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [token]);

  // PLAYER INITIALIZÁLÁSA
  useEffect(() => {
    if (!token) return;

    // 🔒 Ha a token nem változott → ne inicializálj új playert
    if (prevTokenRef.current === token) {
      return;
    }
    prevTokenRef.current = token;

    // 🔥 Régi player lekapcsolása (async, hogy ne dobjon React warningot)
    if (player) {
      player.disconnect();
      setTimeout(() => {
        setPlayer(null);
        setDeviceId(null);
      }, 0);
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
        console.error("Spotify authentication error:", message);
      });

      p.addListener("account_error", ({ message }) => {
        console.error("Spotify account error:", message);
      });

      p.connect();
      setPlayer(p);
    }

    // Spotify SDK betöltésének várása
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
