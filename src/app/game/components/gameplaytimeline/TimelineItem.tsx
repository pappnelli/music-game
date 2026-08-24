import { Song } from "@/lib/store/gameSlice";
import { Active, useDroppable } from "@dnd-kit/core";
import { SelectedCard, SelectedToken } from "../../GameClient";
import EnlargeableSongCard from "./EnlargeableSongCard";
import TimelineSlot from "./TimelineSlot";

interface TimelineItemProps {
  song: Song;
  index: number;
  active: Active | null;
  selectedToken: SelectedToken | null;
  selectedCard: SelectedCard | null;
  isHovered: boolean;
  onTokenClick: (teamId: string, fromPosition: number) => void;
  onCardClick: (fromPosition: number) => void;
  onSlotClick: (index: number) => void;
  onSlotHover: (index: number | null) => void;
}

export default function TimelineItem({
  song,
  index,
  active,
  selectedToken,
  selectedCard,
  isHovered,
  onTokenClick,
  onCardClick,
  onSlotClick,
  onSlotHover,
}: TimelineItemProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { type: "slot", index },
  });

  return (
    <>
      <div className="flex shrink-0 items-center">
        <EnlargeableSongCard song={song} size="medium" />
      </div>

      <TimelineSlot
        index={index}
        isOver={isOver}
        active={active}
        ref={setNodeRef}
        selectedToken={selectedToken}
        selectedCard={selectedCard}
        isHovered={isHovered}
        onTokenClick={onTokenClick}
        onCardClick={onCardClick}
        onSlotClick={onSlotClick}
        onSlotHover={onSlotHover}
      />
    </>
  );
}
