"use client";

import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

interface StartGameButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export default function StartGameButton({ disabled = false, onClick }: StartGameButtonProps) {
  return (
    <Button type="button" size="lg" disabled={disabled} onClick={onClick} className="min-w-44">
      <PlayCircle className="size-5" />
      Start Game
    </Button>
  );
}
