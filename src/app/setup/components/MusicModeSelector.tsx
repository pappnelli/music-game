"use client";

import { cn } from "@/lib/utils";
import SpotifyConnectButton from "./SpotifyConnectButton";

interface MusicModeSelectorProps {
  value: "qr" | "spotify";
  onChange: (mode: "qr" | "spotify") => void;
  isSpotifyLoggedIn: boolean;
  signIn: any;
}

export default function MusicModeSelector({ value, onChange, isSpotifyLoggedIn, signIn }: MusicModeSelectorProps) {
  const isSpotifyEnabled = value === "spotify";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Music Integration</label>

      {/* Fő kapcsoló a Spotify integráció be-/kikapcsolásához */}
      <div className="flex items-center gap-4">
        <div
          onClick={() => (isSpotifyEnabled ? onChange("qr") : onChange("spotify"))}
          className={cn(
            "flex items-center justify-center px-4 py-2 rounded-md border text-sm font-mono uppercase cursor-pointer transition-all duration-300",
            isSpotifyEnabled
              ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_var(--color-primary)]"
              : "bg-app-black/40 border-border text-muted-foreground hover:border-secondary hover:text-secondary",
          )}
        >
          SPOTIFY INTEGRATION
        </div>

        {isSpotifyEnabled && (
          <div className="flex-1 animate-in fade-in duration-300">
            <SpotifyConnectButton isLoggedIn={isSpotifyLoggedIn} onConnect={() => signIn("spotify")} />
          </div>
        )}
      </div>
    </div>
  );
}
