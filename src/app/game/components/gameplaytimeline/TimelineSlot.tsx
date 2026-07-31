import { Team, TokenPlacement } from "@/lib/store/gameSlice";
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
  // const isSame = active?.data?.current?.teamId ===

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

  const baseClasses = "h-[stretch] rounded-lg transition-all duration-300 flex items-center justify-center relative shrink-0";

  const stateClasses =
    isCardOver || isTokenOver
      ? "mx-2 w-12"
      : isCardPlaced || isTokenPlaced
        ? "mx-2 border-none bg-transparent" // Tartalommal teli mód
        : "w-12 mx-[-16px]"; // Üres mód  transition-all duration-300 //4

  return (
    <div ref={ref} className={`${baseClasses} ${stateClasses}`}>
      {isCardPlaced && (
        <div className="transition-transform hover:scale-110 duration-200">
          <Token team={teams.find((t) => t.id === currentTeamId)} type={showSolution ? null : "timeline-guessing-card"} />
        </div>
      )}
      {isTokenPlaced && (
        <div className="transition-transform hover:scale-110 duration-200">
          <Token team={teams.find((t) => t.id === tokenAtPosition?.teamId)} type={showSolution ? null : "timeline-token"} />
        </div>
      )}
    </div>
  );
}
