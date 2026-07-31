"use client";

import { Button } from "@/components/ui/button";
import { Team } from "@/lib/store/setupSlice";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash } from "lucide-react";
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
      <div className="p-4 rounded-xl border border-dashed border-border bg-app-black/20">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">No teams added yet...</p>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={teams} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {teams.map((team) => (
              <SortableTeamItem key={team.id} team={team} onEditTeam={() => setEditingId(team.id)} onRemoveTeam={onRemoveTeam} />
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
  onEditTeam: () => void;
  onRemoveTeam: (id: string) => void;
}

function SortableTeamItem({ team, onEditTeam, onRemoveTeam }: SortableTeamItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    // borderColor: `${team.color}40`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between px-4 py-2 rounded-lg border",
        !isDragging && "transition-all duration-300 backdrop-blur-sm hover:border-secondary",
        isDragging
          ? "bg-primary/20 border-primary shadow-[0_0_20px_var(--color-primary)] scale-[1.02] cursor-grabbing"
          : "bg-app-black/40 border-border",
      )}
    >
      <div
        className="px-2 py-0.5 rounded text-xs uppercase font-mono border"
        style={{
          borderColor: team.color,
          color: team.color,
          backgroundColor: `${team.color}10`,
        }}
      >
        {team.name}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEditTeam} className="text-muted-foreground hover:text-secondary">
          <Pencil size={16} />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => onRemoveTeam(team.id)} className="text-muted-foreground hover:text-primary">
          <Trash size={16} />
        </Button>

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical size={16} />
        </div>
      </div>
    </div>
  );
}
