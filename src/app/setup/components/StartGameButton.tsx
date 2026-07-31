"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface StartGameButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export default function StartGameButton({ disabled = false, onClick }: StartGameButtonProps) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      // className={cn(
      //   "flex items-center gap-3 px-8 py-6 text-xl font-black uppercase tracking-[0.2em] transition-all duration-300",
      //   disabled
      //     ? "bg-transparent border border-muted text-muted-foreground cursor-not-allowed opacity-50"
      //     : "bg-primary/20 border-2 border-primary text-primary hover:bg-primary hover:text-app-black hover:shadow-[0_0_30px_var(--color-primary)] shadow-[0_0_15px_rgba(255,0,255,0.2)]",
      // )}
      className={cn(
        "flex items-center gap-3 h-14 px-10 text-lg font-black uppercase tracking-[0.2em] transition-all duration-300",
        disabled
          ? "bg-transparent border border-muted text-muted-foreground cursor-not-allowed opacity-50"
          : "bg-primary/20 border-2 border-primary text-primary hover:bg-primary hover:text-app-black hover:shadow-[0_0_30px_var(--color-primary)]",
      )}
    >
      <Play size={24} fill="currentColor" />
      Start game
    </Button>
  );
}
