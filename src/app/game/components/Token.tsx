import { Team } from "@/lib/store/gameSlice";
import { Team as setupTeam } from "@/lib/store/setupSlice";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";

interface TokenProps {
  team: Team | setupTeam | undefined;
  className?: string | null;
  type?: string | null;
}

export default function Token({ team, className, type }: TokenProps) {
  const { color, id: teamId, name: teamName } = team ?? {};

  const isGuessingCard = type === "guessing-card" || type === "timeline-guessing-card";
  const draggableId = `${type ?? ""}-${teamId}`;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: {
      title: type ?? "",
      type: isGuessingCard ? "guessing-card" : "token",
      teamId,
    },
  });

  const style: React.CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .filter((char) => char === char.toUpperCase())
      .join("")
      .slice(0, 4);
  };

  if (!type) {
    return (
      <div className={cn("flex flex-col items-center group", className)}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border-2 bg-app-black"
          style={{ borderColor: color, boxShadow: `0 0 15px ${color}60` }}
        >
          <div
            className="w-8 h-8 rounded-full border flex items-center justify-center"
            style={{
              borderColor: `${color}60`,
              boxShadow: `inset 0 0 10px ${color}40, 0 0 10px ${color}40`,
            }}
          >
            <span className="font-black text-xs text-app-white tracking-tighter">{getInitials(teamName || "?")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cn("flex flex-col items-center group cursor-grab active:cursor-grabbing", className, isDragging ? "z-10" : "")}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center border-2 bg-app-black"
        style={{ borderColor: color, boxShadow: `0 0 15px ${color}60` }}
      >
        <div
          className="w-8 h-8 rounded-full border flex items-center justify-center"
          style={{
            borderColor: `${color}60`,
            boxShadow: `inset 0 0 10px ${color}40, 0 0 10px ${color}40`,
          }}
        >
          <span className="font-black text-xs text-app-white tracking-tighter">{getInitials(teamName || "?")}</span>
        </div>
      </div>
    </div>
  );
}
