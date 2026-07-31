"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const SpotifyPlayerContext = createContext<any>(null);

export const SpotifyPlayerProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const isPlaybackActive = searchParams.get("playback") === "active";

  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (status !== "authenticated" || !accessToken || !isPlaybackActive) return;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new (window as any).Spotify.Player({
        name: "Music Game Player",
        getOAuthToken: async (cb: (token: string) => void) => {
          try {
            const res = await fetch("/api/auth/session");
            const session = await res.json();

            if (session?.accessToken) {
              cb(session.accessToken);
            } else {
              console.error("Nincs érvényes access token a sessionben a frissítéskor!");
            }
          } catch (err) {
            console.error("Hiba a token lekérésekor a player számára:", err);
          }
        },
        volume: 0.8,
      });

      player.addListener("ready", (data: any) => {
        console.log("SDK Ready, ID:", data.device_id);
        setDeviceId(data.device_id);
      });

      player.addListener("initialization_error", (e: any) => console.error("Init hiba:", e));
      player.addListener("authentication_error", (e: any) => {
        console.error("Hitelesítési hiba (Auth error):", e);
        // Opcionálisan itt megpróbálhatod újra csatlakoztatni a playert, ha volt hiba TODO
      });
      player.addListener("account_error", (e: any) => console.error("Fiók hiba (Account error):", e));

      player.connect();
    };

    if (!document.getElementById("spotify-player-sdk")) {
      const script = document.createElement("script");
      script.id = "spotify-player-sdk";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
    }
  }, [accessToken, status, isPlaybackActive]);

  return <SpotifyPlayerContext.Provider value={{ deviceId, player: null }}>{children}</SpotifyPlayerContext.Provider>;
};

export const useSpotify = () => useContext(SpotifyPlayerContext);
