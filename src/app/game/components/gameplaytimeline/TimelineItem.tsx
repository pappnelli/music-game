import { Song } from "@/lib/store/gameSlice";
import { Active, useDroppable } from "@dnd-kit/core";
import SongCard from "./SongCard";
import TimelineSlot from "./TimelineSlot";

interface TimelineItemProps {
  song: Song;
  index: number;
  active: Active | null;
}

export default function TimelineItem({ song, index, active }: TimelineItemProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { type: "slot", index },
  });

  return (
    <>
      <div className="flex shrink-0 items-center">
        <SongCard song={song} size="medium" />
      </div>

      <TimelineSlot index={index} isOver={isOver} active={active} ref={setNodeRef} />
    </>
  );
}
