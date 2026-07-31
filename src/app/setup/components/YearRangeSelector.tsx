"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Minus, Plus } from "lucide-react";

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
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Released after</label>

        <div className="flex flex-col gap-2">
          {/* FROM */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onStartChange(Math.max(1, (yearStart ?? 1) - 1))}
              className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-all duration-300"
            >
              <Minus size={16} />
            </Button>

            <Input
              type="number"
              placeholder="START"
              value={yearStart ?? ""}
              onChange={(e) => handleStartInput(e.target.value)}
              className="h-10 w-24 text-center bg-app-black/40 border-border font-mono focus:border-primary focus:border-2 focus:ring-app-white focus-visible:ring-2"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => onStartChange((yearStart ?? 1) + 1)}
              className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-all duration-300"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Released before</label>

        <div className="flex items-center gap-2">
          {/* TO */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEndChange(Math.max(1, (yearEnd ?? 1) - 1))}
            className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-all duration-300"
          >
            <Minus size={16} />
          </Button>

          <Input
            type="number"
            placeholder="END"
            value={yearEnd ?? ""}
            onChange={(e) => handleEndInput(e.target.value)}
            className="h-10 w-24 text-center bg-app-black/40 border-border font-mono focus:border-primary focus:border-2 focus:ring-app-white focus-visible:ring-2"
          />

          <Button
            variant="outline"
            size="icon"
            onClick={() => onEndChange((yearEnd ?? 1) + 1)}
            className="h-10 w-10 shrink-0 border-border bg-app-black/40 hover:bg-primary/20 hover:border-primary transition-all duration-300"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
