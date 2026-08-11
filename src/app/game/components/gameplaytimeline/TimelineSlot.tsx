import { Team, TokenPlacement } from "@/lib/store/gameSlice";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import Token from "../Token";
import { Active } from "@dnd-kit/core";

interface SlotProps {
  index: number;
  isOver: boolean;
  active?: Active | null;
  ref: (element: HTMLElement | null) => void;
}

interface GameState {
  game: {
    teams: Team[];
    currentTeamId: string | null;
    cardPosition: number | null;
    showSolution: boolean;
    tokens: TokenPlacement[];
  };
}

export default function TimelineSlot({ index, isOver, active, ref }: SlotProps) {
  const teams = useSelector((state: GameState) => state.game.teams ?? []);
  const currentTeamId = useSelector((state: GameState) => state.game.currentTeamId);
  const cardPosition = useSelector((state: GameState) => state.game.cardPosition);
  const showSolution = useSelector((state: GameState) => state.game.showSolution);
  const tokens = useSelector((state: GameState) => state.game.tokens ?? []);

  const tokenAtPosition = tokens.find((t) => t.position === index);

  const isDraggingCard = active?.data.current?.type === "guessing-card";
  const isDraggingToken = active?.data.current?.type === "token";

  const isCardOver = isOver && isDraggingCard && !tokenAtPosition;
  const isTokenOver =
    isOver &&
    isDraggingToken &&
    cardPosition !== index &&
    (!tokenAtPosition || (tokenAtPosition && active?.data?.current?.teamId === tokenAtPosition.teamId));

  const isCardPlaced = cardPosition === index && !isDraggingCard;
  const isTokenPlaced =
    tokenAtPosition && (!isDraggingToken || (isDraggingToken && active?.data?.current?.teamId !== tokenAtPosition?.teamId));

  const isHighlighted = isCardOver || isTokenOver;
  const isFilled = isCardPlaced || isTokenPlaced;

  const baseClasses = "h-full min-h-16 rounded-lg transition-all duration-200 flex items-center justify-center relative shrink-0";

  const stateClasses = isHighlighted
    ? "w-50 mx-[-64px]"
    : isFilled
      ? "w-50 mx-[-64px]"
      : "w-36 mx-[-64px] before:absolute before:h-3/4 before:w-1 before:rounded-full before:bg-border/60";

  const slotClasses = isHighlighted
    ? "w-14 h-3/4 border-2 border-dashed border-primary bg-primary/15 animate-pulse"
    : isFilled
      ? "w-14 h-3/4 border-none bg-transparent"
      : "w-4 h-3/4";

  return (
    <div ref={ref} className={cn(baseClasses, stateClasses)}>
      <div
        className={cn(
          "h-full min-h-16 rounded-lg transition-all duration-200 flex items-center justify-center relative shrink-0",
          slotClasses,
        )}
      >
        {isCardPlaced && (
          <div>
            <Token team={teams.find((t) => t.id === currentTeamId)} type={showSolution ? null : "timeline-guessing-card"} />
          </div>
        )}
        {isTokenPlaced && (
          <div>
            <Token team={teams.find((t) => t.id === tokenAtPosition?.teamId)} type={showSolution ? null : "timeline-token"} />
          </div>
        )}
      </div>
    </div>
  );
}
