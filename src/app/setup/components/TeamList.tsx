"use client";

import { Button } from "@/components/ui/button";
import { TeamDisc } from "@/components/Disc";
import { Team } from "@/lib/store/setupSlice";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Users } from "lucide-react";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { cn } from "@/lib/utils";
import EditTeamDialog from "./EditTeamDialog";
import { useState } from "react";

interface TeamListProps {
  teams: Team[];
  onRemoveTeam: (id: string) => void;
  reorderTeams: (newTeams: Team[]) => void;
}

export default function TeamList({ teams, onRemoveTeam, reorderTeams }: TeamListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTeam = teams.find((t) => t.id === editingId) || null;

  // Szenzorok beállítása (egér/touch és billentyűzet támogatás)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Kezeli a leejtés (drop) eseményt
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = teams.findIndex((team) => team.id === active.id);
      const newIndex = teams.findIndex((team) => team.id === over.id);
      reorderTeams(arrayMove(teams, oldIndex, newIndex));
    }
  }

  if (teams.length === 0) {
    return (
      <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-center">
        <Users className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-semibold text-muted-foreground">No teams yet — add at least two to start.</p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={teams} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {teams.map((team, index) => (
              <SortableTeamItem key={team.id} team={team} index={index} onEditTeam={() => setEditingId(team.id)} onRemoveTeam={onRemoveTeam} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <EditTeamDialog team={editingTeam} allTeams={teams} onClose={() => setEditingId(null)} />
    </>
  );
}

interface SortableTeamItemProps {
  team: Team;
  index: number;
  onEditTeam: () => void;
  onRemoveTeam: (id: string) => void;
}

function SortableTeamItem({ team, index, onEditTeam, onRemoveTeam }: SortableTeamItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-xl border-2 border-border bg-muted/40 py-1.5 pr-1.5 pl-2.5 transition-shadow",
        isDragging ? "cursor-grabbing border-primary shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary),black_25%)]" : "backdrop-blur-sm"
      )}
    >
      <span className="w-5 shrink-0 text-center text-xs font-black text-muted-foreground">{index + 1}</span>

      <TeamDisc team={team} size={40} />

      <span className={cn("flex-1 truncate text-sm", TEAM_NAME_CLASS)} style={teamNameGlowStyle(team.color)}>
        {team.name}
      </span>

      <Button type="button" variant="ghost" size="icon-sm" onClick={onEditTeam} aria-label={`Edit ${team.name}`}>
        <Pencil size={15} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemoveTeam(team.id)}
        aria-label={`Remove ${team.name}`}
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 size={15} />
      </Button>
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </div>
    </div>
  );
}
