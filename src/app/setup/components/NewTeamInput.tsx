"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

interface NewTeamInputProps {
  onAddTeam: (name: string) => void;
}

export default function NewTeamInput({ onAddTeam }: NewTeamInputProps) {
  const [teamName, setTeamName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const trimmed = teamName.trim();
    if (!trimmed) return;

    onAddTeam(trimmed);
    setTeamName("");

    // fókusz vissza az inputra
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Add Team</label>
      <div className="flex items-center gap-2 w-full">
        <Input
          ref={inputRef}
          placeholder="ENTER_TEAM_NAME..."
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className={cn(
            "h-10 px-3 bg-app-black/40 border-border focus:border-primary focus:border-2 focus:ring-app-white focus-visible:ring-2",
            "font-mono uppercase placeholder:text-muted-foreground/50 transition-all duration-300",
          )}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={handleAdd}
          disabled={!teamName.trim()}
          className={cn(
            "h-10 w-10 border-secondary text-secondary hover:bg-secondary hover:text-app-black",
            "hover:shadow-[0_0_15px_var(--color-secondary)] transition-all duration-300 shrink-0",
          )}
        >
          <Plus size={18} />
        </Button>
      </div>
    </div>
  );
}
