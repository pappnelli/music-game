"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { signIn as signInFn } from "next-auth/react";
import { Radio } from "lucide-react";
import SpotifyConnectButton from "./SpotifyConnectButton";

interface MusicModeSelectorProps {
  value: "qr" | "spotify";
  onChange: (mode: "qr" | "spotify") => void;
  isSpotifyLoggedIn: boolean;
  signIn: typeof signInFn;
}

export default function MusicModeSelector({ value, onChange, isSpotifyLoggedIn, signIn }: MusicModeSelectorProps) {
  const isSpotify = value === "spotify";

  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <Radio className="size-4 text-accent" />
        Music playback
      </Label>

      <div className="flex items-center justify-between gap-2.5">
        <div>
          <p className="text-sm font-bold text-foreground">Spotify playback</p>
          <p className="mt-0.5 text-xs font-normal text-muted-foreground">
            On: auto-plays through a connected device.
            <br />
            Off: players scan a QR code instead.
          </p>
        </div>

        <Switch checked={isSpotify} onCheckedChange={(checked) => onChange(checked ? "spotify" : "qr")} aria-label="Toggle Spotify playback" />
      </div>

      {isSpotify && (
        <div className="pt-1">
          <SpotifyConnectButton isLoggedIn={isSpotifyLoggedIn} onConnect={() => signIn("spotify")} />
        </div>
      )}
    </div>
  );
}
