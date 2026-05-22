import { useDraggable, useDroppable } from "@dnd-kit/core";
import { useDispatch, useSelector } from "react-redux";
import { removeCard, removeToken, setShowSolution } from "../../pages/Game/gameSlice";
import GuessingCard from "../game/GuessingCard";
import Token from "../game/Token";
import Placeholder from "./Placeholder";

function DraggableTimelineGuessingCard() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "timeline-guessing-card",
    data: { type: "timeline-guessing-card" },
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    cursor: transform ? "grabbing" : "grab",
    touchAction: "none",
    zIndex: 11,
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <GuessingCard />
    </div>
  );
}

function DraggableTimelineToken({ teamId }) {
  const teams = useSelector((state) => state.game.teams ?? []);
  const team = teams.find((t) => t.id === teamId) ?? null;

  const color = team.color;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    // id: "timeline-token",
    id: `timeline-token-${teamId}`,
    data: { type: "timeline-token", teamId },
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

export default function Slot({ index, active }) {
  const dispatch = useDispatch();

  const teams = useSelector((state) => state.game.teams ?? []);
  const currentTeamId = useSelector((state) => state.game.currentTeamId);
  const cardPosition = useSelector((state) => state.game.cardPosition);
  const showSolution = useSelector((state) => state.game.showSolution);
  const tokens = useSelector((state) => state.game.tokens ?? []);

  const team = teams.find((t) => t.id === currentTeamId) ?? null;
  const cards = team?.cards ?? [];
  const token = tokens.find((t) => t.position === index) ?? null;

  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { type: "slot", index },
  });

  const isNotFirst = index !== 0;
  const isFirstOrLast = index === 0 || index === cards.length;

  const dndWidth =
    active?.id === "guessing-card" || active?.id === "timeline-guessing-card"
      ? "60px"
      : active?.id?.startsWith("token") || active?.id?.startsWith("timeline-token")
        ? "52px"
        : 0;

  const placedGuessingCardShows = cardPosition === index && active?.id !== "timeline-guessing-card";

  const placedTokenShows =
    tokens.some((t) => t.position === index) &&
    (!active?.id?.startsWith("timeline-token") || active.data.current?.teamId !== token?.teamId);

  return (
    <>
      {active && !placedGuessingCardShows && !placedTokenShows && (
        <div
          ref={setNodeRef}
          style={{
            position: "absolute",
            top: "0",
            left: isNotFirst ? "66px" : isOver ? 0 : `-${dndWidth}`,
            width: isFirstOrLast ? `calc(66px + ${dndWidth})` : isOver ? `calc(132px + ${dndWidth})` : "132px",
            height: "124px",
            pointerEvents: "none",
            transition: "0.15s",
            borderRadius: "8px",
            zIndex: 9,
          }}
        />
      )}

      <Placeholder
        index={index}
        active={active}
        isOver={isOver}
        placedGuessingCardShows={placedGuessingCardShows}
        placedTokenShows={placedTokenShows}
      >
        {placedGuessingCardShows &&
          (showSolution ? (
            <div
              onClick={() => {
                dispatch(setShowSolution(false));
                dispatch(removeCard());
              }}
            >
              <GuessingCard />
            </div>
          ) : (
            <DraggableTimelineGuessingCard />
          ))}

        {placedTokenShows &&
          (showSolution ? (
            <div
              onClick={() => {
                dispatch(setShowSolution(false));
                dispatch(removeToken({ teamId: token?.teamId }));
              }}
            >
              <Token color={teams.find((t) => t.id === token?.teamId)?.color} />
            </div>
          ) : (
            <DraggableTimelineToken teamId={token?.teamId} />
          ))}
      </Placeholder>
    </>
  );
}

// export default function Slot({ index, active }) {
//   const dispatch = useDispatch();

//   const currentTeamId = useSelector((state) => state.game.currentTeamId);
//   const cards = useSelector((state) => state.game.teams?.find((t) => t.id === currentTeamId)?.cards);

//   const { setNodeRef, isOver } = useDroppable({
//     id: `slot-${index}`,
//     data: { type: "slot", index },
//   });

//   const isNotFirst = index !== 0;
//   const isFirstOrLast = index === 0 || index === cards?.length;

//   const dndWidth =
//     active?.id === "guessing-card" || active?.id === "timeline-guessing-card"
//       ? "60px"
//       : active?.id?.startsWith("token") || active?.id?.startsWith("timeline-token")
//         ? "52px"
//         : 0;

//   // const { cardPosition, showSolution, tokens, teams } = useSelector((state) => state.game);
//   const { cardPosition, showSolution, tokens, teams } = useSelector((state) => ({
//     cardPosition: state.game.cardPosition,
//     showSolution: state.game.showSolution,
//     tokens: state.game.tokens ?? [],
//     teams: state.game.teams ?? [],
//   }));

//   const token = tokens?.find((t) => t.position === index);

//   const placedGuessingCardShows = cardPosition === index && active?.id !== "timeline-guessing-card";
//   const placedTokenShows =
//     tokens?.some((t) => t.position === index) &&
//     (!active?.id?.startsWith("timeline-token") || active.data.current?.teamId !== token?.teamId);

//   return (
//     <>
//       {active && !placedGuessingCardShows && !placedTokenShows && (
//         <div
//           ref={setNodeRef}
//           style={{
//             position: "absolute",
//             top: "0",
//             left: isNotFirst ? "66px" : isOver ? 0 : `-${dndWidth}`,
//             width: isFirstOrLast ? `calc(66px + ${dndWidth})` : isOver ? `calc(132px + ${dndWidth})` : "132px",
//             height: "124px",
//             pointerEvents: "none",
//             // background: "#ff00bb49",
//             transition: "0.15s",
//             borderRadius: "8px",
//             zIndex: 9,
//           }}
//         />
//       )}

//       <Placeholder
//         index={index}
//         active={active}
//         isOver={isOver}
//         placedGuessingCardShows={placedGuessingCardShows}
//         placedTokenShows={placedTokenShows}
//       >
//         {placedGuessingCardShows &&
//           (showSolution ? (
//             <div
//               onClick={() => {
//                 dispatch(setShowSolution(false));
//                 dispatch(removeCard());
//               }}
//             >
//               <GuessingCard />
//             </div>
//           ) : (
//             <DraggableTimelineGuessingCard />
//           ))}

//         {placedTokenShows &&
//           (showSolution ? (
//             <div
//               onClick={() => {
//                 dispatch(setShowSolution(false));
//                 dispatch(removeToken({ teamId: token?.teamId }));
//               }}
//             >
//               <Token color={teams.find((t) => t.id === token?.teamId)?.color} />
//             </div>
//           ) : (
//             <DraggableTimelineToken teamId={token?.teamId} />
//           ))}
//       </Placeholder>
//     </>
//   );
// }
