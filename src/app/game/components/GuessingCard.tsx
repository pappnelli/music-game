"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface GuessingCardProps {
  color: string;
  type?: string;
}

export default function GuessingCard({ color, type }: GuessingCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: type || "",
    data: { type },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    touchAction: "none",
    zIndex: isDragging ? 50 : 11,
    borderColor: color,
  };

  if (!type) {
    return (
      <div style={style} className="w-12 h-12 rounded-lg border-2 flex items-center justify-center bg-card shadow-md">
        <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center animate-spin-slow">
          <div className="w-2 h-2 rounded-full bg-primary" />
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
      className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center bg-card shadow-md ${
        isDragging ? "opacity-0" : "opacity-100 cursor-grab"
      }`}
    >
      <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center animate-spin-slow">
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>
    </div>
  );
}
