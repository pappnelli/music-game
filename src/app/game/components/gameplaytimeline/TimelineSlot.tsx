import { Team, TokenPlacement } from "@/lib/store/gameSlice";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { SelectedCard, SelectedToken } from "../../GameClient";
import Token from "../Token";
import { Active } from "@dnd-kit/core";

interface SlotProps {
  index: number;
  isOver: boolean;
  active?: Active | null;
  ref: (element: HTMLElement | null) => void;
  selectedToken: SelectedToken | null;
  selectedCard: SelectedCard | null;
  /** Whether the cursor is currently over this slot while something is armed for click-to-place. */
  isHovered: boolean;
  onTokenClick: (teamId: string, fromPosition: number) => void;
  onCardClick: (fromPosition: number) => void;
  onSlotClick: (index: number) => void;
  onSlotHover: (index: number | null) => void;
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

export default function TimelineSlot({
  index,
  isOver,
  active,
  ref,
  selectedToken,
  selectedCard,
  isHovered,
  onTokenClick,
  onCardClick,
  onSlotClick,
  onSlotHover,
}: SlotProps) {
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

  // Same eligibility a live drag-hover would use, but driven by the click-armed token instead of
  // an actual drag -- this slot is a *legal* target for it.
  const isTokenSelectableHere =
    !!selectedToken &&
    index !== cardPosition &&
    (!tokenAtPosition || tokenAtPosition.teamId === selectedToken.teamId);

  // Same idea for the click-armed guessing card -- any slot without a token in it is a legal
  // drop target, including the card's own current slot (clicking that just cancels the pickup).
  const isCardSelectableHere = !!selectedCard && !tokenAtPosition;

  const isSelectable = isTokenSelectableHere || isCardSelectableHere;

  // Legal isn't the same as lit up: like an actual drag, only the slot the cursor is physically
  // over should show the "drop here" treatment -- the rest of the legal slots stay quiet until
  // hovered, mirroring isCardOver/isTokenOver's own isOver gate above.
  const isSelectedAndHovered = isSelectable && isHovered;

  const isCardPlaced = cardPosition === index && !isDraggingCard;
  const isTokenPlaced =
    tokenAtPosition && (!isDraggingToken || (isDraggingToken && active?.data?.current?.teamId !== tokenAtPosition?.teamId));

  const isHighlighted = isCardOver || isTokenOver || isSelectedAndHovered;
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
    <div
      ref={ref}
      data-token-ui=""
      onClick={() => onSlotClick(index)}
      onMouseEnter={() => isSelectable && onSlotHover(index)}
      onMouseLeave={() => isSelectable && onSlotHover(null)}
      className={cn(baseClasses, stateClasses, isSelectable && "cursor-pointer")}
    >
      <div
        className={cn(
          "h-full min-h-16 rounded-lg transition-all duration-200 flex items-center justify-center relative shrink-0",
          slotClasses,
        )}
      >
        {isCardPlaced && (
          <div>
            <Token
              team={teams.find((t) => t.id === currentTeamId)}
              type={showSolution ? null : "timeline-guessing-card"}
              onClick={showSolution ? undefined : () => onCardClick(index)}
              isSelected={!!selectedCard && selectedCard.fromPosition === index}
            />
          </div>
        )}
        {isTokenPlaced && tokenAtPosition && (
          <div>
            <Token
              team={teams.find((t) => t.id === tokenAtPosition?.teamId)}
              type={showSolution ? null : "timeline-token"}
              onClick={showSolution ? undefined : () => onTokenClick(tokenAtPosition.teamId, index)}
              isSelected={selectedToken?.teamId === tokenAtPosition?.teamId && selectedToken?.fromPosition === index}
            />
          </div>
        )}
      </div>
    </div>
  );
}
