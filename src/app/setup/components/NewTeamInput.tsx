"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        placeholder="New team name…"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
        aria-label="New team name"
      />

      <Button type="button" size="icon" onClick={handleAdd} disabled={!teamName.trim()} aria-label="Add team">
        <Plus size={18} />
      </Button>
    </div>
  );
}
