import { useSelector } from "react-redux";

export default function HitCount({ teamId }) {
  const teams = useSelector((state) => state.game.teams ?? []);

  const team = teams.find((t) => t.id === teamId) ?? null;

  const cardCount = team?.cards?.length ?? 0;
  const color = team?.color ?? "#000";

  return (
    <div className="hit-count" style={{ border: `2px solid ${color}` }}>
      <span style={{ fontWeight: "bold" }}>{cardCount}</span>
    </div>
  );
}
