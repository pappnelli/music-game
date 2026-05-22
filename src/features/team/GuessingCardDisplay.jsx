import { useDraggable } from "@dnd-kit/core";
import { useSelector } from "react-redux";
import GuessingCard from "../game/GuessingCard";

function DraggableGuessingCard() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "guessing-card",
    data: { type: "guessing-card" },
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    touchAction: "none",
    cursor: transform ? "grabbing" : "grab",
    zIndex: 11,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <GuessingCard />
    </div>
  );
}

export default function GuessingCardDisplay({ active }) {
  const cardPosition = useSelector((state) => state.game.cardPosition);

  const draggingCard = active?.id === "guessing-card";

  const guessingCardShows = cardPosition === null && !draggingCard;

  return (
    <div className="guessing-card-display" style={{ marginRight: guessingCardShows ? "calc(432px - 84px)" : "432px" }}>
      <h3>Guess where the song belongs in the timeline!</h3>

      {guessingCardShows && <DraggableGuessingCard />}
    </div>
  );
}
