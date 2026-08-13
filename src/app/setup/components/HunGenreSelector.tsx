"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { HunGenreMode } from "@/lib/store/gameSlice";
import { cn } from "@/lib/utils";
import { Ban, Flag, ListMusic, LucideIcon } from "lucide-react";

interface HunGenreSelectorProps {
  value: HunGenreMode;
  onChange: (value: HunGenreMode) => void;
}

interface HunModeOption {
  id: HunGenreMode;
  label: string;
  hint: string;
  icon: LucideIcon;
}

const MODES: HunModeOption[] = [
  {
    id: "include",
    label: "Include normally",
    hint: "Hungarian-tagged songs stay in the pool alongside everything else.",
    icon: ListMusic,
  },
  {
    id: "exclude",
    label: "Exclude Hungarian songs",
    hint: "Hungarian-tagged songs are removed from the pool entirely.",
    icon: Ban,
  },
  {
    id: "only",
    label: "Hungarian songs only",
    hint: "Only Hungarian-tagged songs are used; other genre filters are ignored.",
    icon: Flag,
  },
];

export default function HunGenreSelector({ value, onChange }: HunGenreSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <Flag className="size-4 text-accent" />
        Hungarian songs
      </Label>

      <RadioGroup value={value} onValueChange={(v) => onChange(v as HunGenreMode)} className="flex flex-col gap-2">
        {MODES.map((mode) => {
          const isSelected = value === mode.id;
          const Icon = mode.icon;

          return (
            <div key={mode.id}>
              <RadioGroupItem id={`hun-mode-${mode.id}`} value={mode.id} className="peer sr-only" />
              <Label
                htmlFor={`hun-mode-${mode.id}`}
                className={cn(
                  "flex cursor-pointer flex-row items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 transition-all",
                  isSelected ? "border-primary bg-primary/10" : "border-border bg-muted/40 hover:border-primary/30",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 bg-background",
                    isSelected ? "border-primary" : "border-border",
                  )}
                >
                  <span className={cn("size-2.5 rounded-full bg-primary transition-transform", isSelected ? "scale-100" : "scale-0")} />
                </span>

                <span className="flex flex-col gap-1">
                  <span className={cn("flex items-center gap-1.5 text-sm font-bold", isSelected ? "text-primary" : "text-foreground")}>
                    <Icon className="size-4" />
                    {mode.label}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{mode.hint}</span>
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
