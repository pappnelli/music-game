"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FinalRoundRuleSelectorProps {
  value: "instant" | "complete";
  onChange: (value: "instant" | "complete") => void;
}

export default function FinalRoundRuleSelector({ value, onChange }: FinalRoundRuleSelectorProps) {
  const rules = [
    { id: "instant", label: "INSTANT END" },
    { id: "complete", label: "COMPLETE ROUND" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Final Round Rule</Label>

      <RadioGroup value={value} onValueChange={(v) => onChange(v as "instant" | "complete")} className="grid grid-cols-2 gap-4">
        {rules.map((rule) => {
          const isSelected = value === rule.id;

          return (
            <div key={rule.id} className="relative">
              <RadioGroupItem id={`rule-${rule.id}`} value={rule.id} className="peer sr-only" />
              <Label
                htmlFor={`rule-${rule.id}`}
                className={cn(
                  "flex items-center justify-center px-4 py-2 rounded-md border text-sm font-mono uppercase cursor-pointer transition-all duration-300",
                  isSelected
                    ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_var(--color-primary)]"
                    : "bg-app-black/40 border-border text-muted-foreground hover:border-secondary hover:text-secondary",
                )}
              >
                {rule.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
