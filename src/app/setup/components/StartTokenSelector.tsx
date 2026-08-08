"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Zap } from "lucide-react";

interface StartTokenSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function StartTokenSelector({ value, onChange }: StartTokenSelectorProps) {
  function handleInput(v: string) {
    const num = Number(v);
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <Zap className="size-4 text-secondary" />
        Starting steal tokens
      </Label>

      <div className="flex items-center gap-1.5">
        <Button type="button" size="icon" variant="outline" onClick={() => onChange(Math.max(0, value - 1))} aria-label="Decrease starting tokens">
          <Minus size={16} />
        </Button>

        <Input
          type="number"
          placeholder="0"
          value={value}
          onChange={(e) => handleInput(e.target.value)}
          className="text-center font-bold tabular-nums"
        />

        <Button type="button" size="icon" variant="outline" onClick={() => onChange(value + 1)} aria-label="Increase starting tokens">
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}
