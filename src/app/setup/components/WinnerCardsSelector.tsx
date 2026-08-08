"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trophy } from "lucide-react";

interface WinnerCardsSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function WinnerCardsSelector({ value, onChange }: WinnerCardsSelectorProps) {
  function handleInput(v: string) {
    const num = Number(v);
    if (!isNaN(num) && num >= 2) {
      onChange(num);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <Trophy className="size-4 text-secondary" />
        Cards to win
      </Label>

      <div className="flex items-center gap-1.5">
        <Button type="button" size="icon" variant="outline" onClick={() => onChange(Math.max(2, value - 1))} aria-label="Decrease cards to win">
          <Minus size={16} />
        </Button>

        <Input
          type="number"
          placeholder="2"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          className="text-center font-bold tabular-nums"
        />

        <Button type="button" size="icon" variant="outline" onClick={() => onChange(value + 1)} aria-label="Increase cards to win">
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
