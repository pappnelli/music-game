"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { editTeam, Team } from "@/lib/store/setupSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Save, X } from "lucide-react";
import { TEAM_COLORS } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import Token from "@/app/game/components/Token";

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
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-app-black border border-border backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] p-6 rounded-2xl z-50 text-foreground font-mono [&>button]:hidden overflow-hidden">
        <DialogHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold font-mono uppercase tracking-wider text-app-white">_EDIT_TEAM</DialogTitle>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">ID: {team.id.slice(0, 6)}</span>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Team Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="ENTER_TEAM_NAME..."
              className={cn(
                "h-10 px-3 bg-app-black/40 border-border focus:border-primary focus:border-2 focus:ring-app-white focus-visible:ring-2",
                "font-mono uppercase placeholder:text-muted-foreground/50 transition-all duration-300",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">Team Color</label>

            <div className="m-fill flex flex-wrap gap-2 pt-1 px-1 items-center justify-center">
              {TEAM_COLORS.map((c) => {
                const isUsedByOther = usedColorsByOthers.includes(c);
                const isSelected = color === c;

                if (isUsedByOther) return null;

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="cursor-pointer focus:outline-none flex items-center justify-center p-1"
                  >
                    <div
                      className={cn(
                        "transition-all duration-300 flex items-center justify-center",
                        isSelected ? "opacity-100 scale-100" : "opacity-40 hover:opacity-60 scale-90",
                      )}
                    >
                      <Token team={{ ...team, name, color: c }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-secondary text-secondary hover:bg-secondary hover:text-app-black hover:shadow-[0_0_15px_var(--color-secondary)] transition-all duration-300 font-mono text-xs uppercase tracking-widest cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-primary/15 border border-primary text-primary hover:bg-primary hover:text-app-black transition-all duration-300 shadow-[0_0_15px_rgba(var(--primary-rgb,0,255,200),0.25)] hover:shadow-[0_0_20px_rgba(var(--primary-rgb,0,255,200),0.8)] disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
