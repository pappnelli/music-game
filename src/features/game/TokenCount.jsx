import { useSelector } from "react-redux";
import Token from "./Token";
import { useDraggable } from "@dnd-kit/core";

function DraggableToken({ teamId }) {
  const teams = useSelector((state) => state.game.teams ?? []);
  const team = teams.find((t) => t.id === teamId) ?? null;

  const color = team.color;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `token-${teamId}`,
    data: { type: "token", teamId },
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    touchAction: "none",
    cursor: transform ? "grabbing" : "grab",
    zIndex: 11,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <Token color={color} />
    </div>
  );
}

export default function TokenCount({ teamId }) {
  const teams = useSelector((state) => state.game.teams ?? []);
  const currentTeamId = useSelector((state) => state.game.currentTeamId);
  const cardPosition = useSelector((state) => state.game.cardPosition);
  const showSolution = useSelector((state) => state.game.showSolution);
  const usedTokens = useSelector((state) => state.game.tokens ?? []);

  const team = teams.find((t) => t.id === teamId) ?? null;

  const tokens = team?.tokens ?? 0;
  const color = team?.color ?? null;

  const hasToken = tokens > 0;
  const usedToken = usedTokens.some((token) => token.teamId === teamId);
  const isCardPlaced = cardPosition !== null;
  const isCurrent = currentTeamId === teamId;

  const canUseToken = hasToken && !usedToken && isCardPlaced && !showSolution && !isCurrent;

  return (
    <>
      <div className="token-count" style={{ opacity: hasToken ? 1 : 0, transition: "opacity  0.2s ease" }}>
        {canUseToken ? (
          <>
            <div
              style={{
                position: "absolute",
                pointerEvents: "none",
              }}
            >
              <Token color={color} />
            </div>
            <DraggableToken teamId={teamId} />
          </>
        ) : (
          <Token color={color} />
        )}

        {hasToken && (
          <>
            <span style={{ fontWeight: "bold", marginLeft: "2px" }}>×</span>
            <span style={{ fontWeight: "bold" }}>{tokens}</span>
          </>
        )}
      </div>
    </>
  );
}
