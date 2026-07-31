"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

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
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Win Condition (Cards)</label>
      <div className="flex items-center gap-2">
        {/* MINUS */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange(Math.max(2, value - 1))}
          className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-all duration-300"
        >
          <Minus size={16} />
        </Button>

        {/* INPUT */}
        <Input
          type="number"
          placeholder="2"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          className="h-10 w-24 text-center bg-app-black/40 border-border font-mono focus:border-primary focus:border-2 focus:ring-app-white focus-visible:ring-2"
        />

        {/* PLUS */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChange(value + 1)}
          className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-all duration-300"
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
