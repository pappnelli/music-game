import { Song, Team, TokenPlacement } from "@/lib/store/gameSlice";
import { Active, useDroppable } from "@dnd-kit/core";
import { useSelector } from "react-redux";
import { SelectedCard, SelectedToken } from "../GameClient";
import TimelineItem from "./gameplaytimeline/TimelineItem";
import TimelineSlot from "./gameplaytimeline/TimelineSlot";

interface GameState {
  game: {
    teams: Team[];
    currentTeamId: string | null;
    cardPosition: number | null;
    showSolution: boolean;
    tokens: TokenPlacement[];
  };
}

interface GameplayTimelineProps {
  teamId: string | null;
  active: Active | null;
  selectedToken: SelectedToken | null;
  selectedCard: SelectedCard | null;
  hoveredSlotIndex: number | null;
  onTokenClick: (teamId: string, fromPosition: number) => void;
  onCardClick: (fromPosition: number) => void;
  onSlotClick: (index: number) => void;
  onSlotHover: (index: number | null) => void;
}

export default function GameplayTimeline({
  teamId,
  active,
  selectedToken,
  selectedCard,
  hoveredSlotIndex,
  onTokenClick,
  onCardClick,
  onSlotClick,
  onSlotHover,
}: GameplayTimelineProps) {
  const teams = useSelector((state: GameState) => state.game.teams ?? []);

  const targetTeam = teams.find((t) => t.id === teamId);

  const cards = targetTeam?.cards ?? [];
  const sortedCards = [...cards].sort((a, b) => a.year - b.year);

  const { setNodeRef: setFirstSlotRef, isOver: isFirstOver } = useDroppable({
    id: "slot-0",
    data: { type: "slot", index: 0 },
  });

  const railColor = targetTeam?.color ?? "var(--border)";

  return (
    <div className="relative flex h-full w-full min-w-max items-stretch px-4">
      {/* The rail tints to the current team's color, same as the big-timeline treatment on the
          Teams status panel and Final standings -- it's their timeline, so it reads as theirs. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full"
        style={{
          background: `color-mix(in oklch, ${railColor}, transparent 25%)`,
          boxShadow: `0 2px 0 0 color-mix(in oklch, ${railColor}, black 30%)`,
        }}
      />

      <TimelineSlot
        index={0}
        isOver={isFirstOver}
        active={active}
        ref={setFirstSlotRef}
        selectedToken={selectedToken}
        selectedCard={selectedCard}
        isHovered={hoveredSlotIndex === 0}
        onTokenClick={onTokenClick}
        onCardClick={onCardClick}
        onSlotClick={onSlotClick}
        onSlotHover={onSlotHover}
      />

      {sortedCards.map((song: Song, i: number) => {
        const slotIndex = i + 1;
        return (
          <TimelineItem
            key={song.id}
            song={song}
            index={slotIndex}
            active={active}
            selectedToken={selectedToken}
            selectedCard={selectedCard}
            isHovered={hoveredSlotIndex === slotIndex}
            onTokenClick={onTokenClick}
            onCardClick={onCardClick}
            onSlotClick={onSlotClick}
            onSlotHover={onSlotHover}
          />
        );
      })}
    </div>
  );
}
