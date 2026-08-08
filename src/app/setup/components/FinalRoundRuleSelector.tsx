"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { FlagOff, RefreshCcw, Timer } from "lucide-react";

interface FinalRoundRuleSelectorProps {
  value: "instant" | "complete";
  onChange: (value: "instant" | "complete") => void;
}

export default function FinalRoundRuleSelector({ value, onChange }: FinalRoundRuleSelectorProps) {
  const rules = [
    { id: "instant" as const, label: "End immediately", hint: "Game stops the moment a team hits the win condition.", icon: FlagOff },
    { id: "complete" as const, label: "Finish the round", hint: "Every team gets an equal number of turns first.", icon: RefreshCcw },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Label className="gap-1.5">
        <Timer className="size-4 text-secondary" />
        Final round rule
      </Label>

      <RadioGroup value={value} onValueChange={(v) => onChange(v as "instant" | "complete")} className="flex flex-col gap-2">
        {rules.map((rule) => {
          const isSelected = value === rule.id;
          const Icon = rule.icon;

          return (
            <div key={rule.id}>
              <RadioGroupItem id={`rule-${rule.id}`} value={rule.id} className="peer sr-only" />
              <Label
                htmlFor={`rule-${rule.id}`}
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
                    {rule.label}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{rule.hint}</span>
                </span>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
