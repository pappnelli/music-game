"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Package, Plus } from "lucide-react";

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
      <Label className="gap-1.5">
        <Package className="size-4 text-primary" />
        Songs per year
      </Label>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => {
            if (value === null) return; // No limit → no minus
            onChange(Math.max(1, value - 1));
          }}
          aria-label="Decrease songs per year"
        >
          <Minus size={16} />
        </Button>

        <Input
          type="number"
          placeholder="Unlimited"
          value={value ?? ""}
          onChange={(e) => handleInput(e.target.value)}
          className="text-center font-bold tabular-nums"
        />

        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => {
            if (value === null) onChange(1);
            else onChange(value + 1);
          }}
          aria-label="Increase songs per year"
        >
          <Plus size={16} />
        </Button>
      </div>

      <p className="text-xs font-normal text-muted-foreground">Leave empty for unlimited.</p>
    </div>
  );
}
