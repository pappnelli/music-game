import { Song, Team, TokenPlacement, removeCard, removeToken, setShowSolution } from "@/lib/store/gameSlice";
import { Active, useDroppable } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
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
}

export default function GameplayTimeline({ teamId, active }: GameplayTimelineProps) {
  const teams = useSelector((state: GameState) => state.game.teams ?? []);

  const targetTeam = teams.find((t) => t.id === teamId);

  const cards = targetTeam?.cards ?? [];
  const sortedCards = [...cards].sort((a, b) => a.year - b.year);

  const { setNodeRef: setFirstSlotRef, isOver: isFirstOver } = useDroppable({
    id: "slot-0",
    data: { type: "slot", index: 0 },
  });

  return (
    <div className="flex flex-row justify-center w-full flex-nowrap overflow-visible">
      <TimelineSlot index={0} isOver={isFirstOver} active={active} ref={setFirstSlotRef} />

      {sortedCards.map((song: Song, i: number) => {
        const slotIndex = i + 1;
        return <TimelineItem key={song.id} song={song} index={slotIndex} active={active} />;
      })}
    </div>
  );
}
