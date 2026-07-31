"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface SongsPerYearSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function SongsPerYearSelector({ value, onChange }: SongsPerYearSelectorProps) {
  function handleInput(v: string) {
    if (!v) {
      onChange(null); // No limit
      return;
    }

    const num = Number(v);
    if (!isNaN(num) && num >= 1) {
      onChange(num);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Songs per Year</label>
      <div className="flex items-center gap-2">
        {/* MINUS */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (value === null) return; // No limit → no minus
            onChange(Math.max(1, value - 1));
          }}
          className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-colors"
        >
          <Minus size={16} />
        </Button>

        {/* INPUT */}
        <Input
          type="number"
          placeholder="INF" // TODO no limit
          value={value ?? ""}
          onChange={(e) => handleInput(e.target.value)}
          className="h-10 w-24 text-center bg-app-black/40 border-border font-mono focus:border-primary focus:border-2 focus:ring-app-white focus-visible:ring-2"
        />

        {/* PLUS */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (value === null) onChange(1);
            else onChange(value + 1);
          }}
          className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-colors"
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
