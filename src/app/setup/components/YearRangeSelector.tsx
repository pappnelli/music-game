"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarRange, Minus, Plus } from "lucide-react";

interface YearRangeSelectorProps {
  yearStart: number | null;
  yearEnd: number | null;
  onStartChange: (value: number) => void;
  onEndChange: (value: number) => void;
}

export default function YearRangeSelector({ yearStart, yearEnd, onStartChange, onEndChange }: YearRangeSelectorProps) {
  function handleStartInput(v: string) {
    const num = Number(v);
    if (!isNaN(num) && num >= 1) onStartChange(num);
  }

  function handleEndInput(v: string) {
    const num = Number(v);
    if (!isNaN(num) && num >= 1) onEndChange(num);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <CalendarRange className="size-4 text-primary" />
        Release year range
      </Label>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground">After</span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => onStartChange(Math.max(1, (yearStart ?? 1) - 1))}
              aria-label="Decrease start year"
            >
              <Minus size={16} />
            </Button>

            <Input
              type="number"
              placeholder="START"
              value={yearStart ?? ""}
              onChange={(e) => handleStartInput(e.target.value)}
              className="text-center font-bold tabular-nums"
            />

            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => onStartChange((yearStart ?? 1) + 1)}
              aria-label="Increase start year"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted-foreground">Before</span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => onEndChange(Math.max(1, (yearEnd ?? 1) - 1))}
              aria-label="Decrease end year"
            >
              <Minus size={16} />
            </Button>

            <Input
              type="number"
              placeholder="END"
              value={yearEnd ?? ""}
              onChange={(e) => handleEndInput(e.target.value)}
              className="text-center font-bold tabular-nums"
            />

            <Button type="button" size="icon" variant="outline" onClick={() => onEndChange((yearEnd ?? 1) + 1)} aria-label="Increase end year">
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
