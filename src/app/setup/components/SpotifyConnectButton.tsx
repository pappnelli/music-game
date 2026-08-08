"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Music } from "lucide-react";

interface SpotifyConnectButtonProps {
  isLoggedIn: boolean;
  onConnect: () => void;
}

export default function SpotifyConnectButton({ isLoggedIn, onConnect }: SpotifyConnectButtonProps) {
  if (!isLoggedIn) {
    return (
      <Button type="button" variant="secondary" onClick={onConnect} className="w-full sm:w-auto">
        <Music className="size-4" />
        Connect Spotify
      </Button>
    );
  }

  return (
    <div className="flex w-fit items-center gap-1.5 rounded-full border-2 border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent">
      <CheckCircle2 className="size-4" />
      Spotify connected
    </div>
  );
}
