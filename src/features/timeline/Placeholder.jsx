export default function Placeholder({ active, isOver, placedGuessingCardShows, placedTokenShows, children }) {
  const isGuessingCardOver = isOver && (active?.id === "guessing-card" || active?.id === "timeline-guessing-card");
  const isTokenOver = isOver && (active?.id?.startsWith("token") || active?.id?.startsWith("timeline-token"));

  return (
    <div
      style={{
        width: isGuessingCardOver || placedGuessingCardShows ? "52px" : isTokenOver || placedTokenShows ? "44px" : "0",
        height: isOver || placedGuessingCardShows || placedTokenShows ? "124px" : "0",
        pointerEvents: placedGuessingCardShows || placedTokenShows ? "unset" : "none",
        // background: "#aaff0049",
        transition: "0.15s",
        borderRadius: "8px",
        alignContent: "center",
        margin: isOver || placedGuessingCardShows || placedTokenShows ? "0 0.25rem" : 0,
      }}
    >
      {children}
    </div>
  );
}
