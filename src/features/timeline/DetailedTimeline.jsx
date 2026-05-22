import { useSelector } from "react-redux";
import DetailedCard from "./DetailedCard";
import Slot from "./Slot";

export default function DetailedTimeline({ teamId, active }) {
  const teams = useSelector((state) => state.game.teams ?? []);

  const team = teams.find((t) => t.id === teamId) ?? null;
  const cards = team?.cards ?? [];

  const sorted = cards.slice().sort((a, b) => a.year - b.year);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Slot index={0} active={active} />

      {sorted.map((song, i) => (
        <div key={i} style={{ position: "relative", display: "flex" }}>
          <DetailedCard {...song} />

          <Slot index={i + 1} active={active} />
        </div>
      ))}
    </div>
  );
}
