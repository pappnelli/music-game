"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Music } from "lucide-react";

interface SpotifyConnectButtonProps {
  isLoggedIn: boolean;
  onConnect: () => void;
}

export default function SpotifyConnectButton({ isLoggedIn, onConnect }: SpotifyConnectButtonProps) {
  if (!isLoggedIn) {
    return (
      <Button
        onClick={onConnect}
        className={cn(
          "w-full flex items-center gap-2 font-mono uppercase tracking-widest",
          "bg-primary/20 border border-primary text-primary text-sm hover:bg-primary hover:text-app-black",
          "hover:shadow-[0_0_15px_var(--color-primary)] transition-all duration-300",
        )}
      >
        <Music size={16} />
        Connect Spotify
      </Button>
    );
  }

  return (
    <Button
      // className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent/10 border border-accent/20 text-accent animate-in fade-in duration-500"
      className={cn(
        "w-full flex items-center gap-2 font-mono uppercase tracking-widest",
        "bg-app-white/20 border border-app-white text-app-white text-sm transition-all duration-300",
      )}
      disabled
    >
      <Check size={18} />
      Spotify connected
    </Button>
  );
}
