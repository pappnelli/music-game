"use client";

import { TeamDisc } from "@/components/Disc";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/lib/store/hooks";
import { editTeam, Team } from "@/lib/store/setupSlice";
import { TEAM_COLORS } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EditTeamDialogProps {
  team: Team | null;
  allTeams: Team[];
  onClose: () => void;
}

export default function EditTeamDialog({ team, allTeams, onClose }: EditTeamDialogProps) {
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [color, setColor] = useState("");

  const [prevTeamId, setPrevTeamId] = useState<string | null>(null);

  if (team && team.id !== prevTeamId) {
    setPrevTeamId(team.id);
    setName(team.name);
    setColor(team.color);
  }

  if (!team) return null;

  const usedColorsByOthers = allTeams.filter((t) => t.id !== team.id).map((t) => t.color);

  const handleSave = () => {
    if (!name.trim()) return;
    dispatch(editTeam({ ...team, name: name.trim(), color }));
    onClose();
  };

  return (
    <Dialog open={!!team} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-secondary bg-secondary/10 shadow-[0_3px_0_0_color-mix(in_oklch,var(--secondary),black_25%)]">
              <Pencil className="size-4 text-secondary" />
            </span>
            Edit team
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Enter team name…"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Team color</Label>

            <div className="flex flex-wrap gap-2">
              {TEAM_COLORS.map((c) => {
                const isUsedByOther = usedColorsByOthers.includes(c);
                const isSelected = color === c;

                if (isUsedByOther) return null;

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label="Choose team color"
                    aria-pressed={isSelected}
                    className={cn(
                      "rounded-full transition-all",
                      isSelected ? "scale-100 opacity-100 ring-2 ring-ring ring-offset-2 ring-offset-background" : "scale-90 opacity-40 hover:opacity-70"
                    )}
                  >
                    <TeamDisc team={{ ...team, name, color: c }} size={40} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button type="button" onClick={handleSave} disabled={!name.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
