import { useSelector } from "react-redux";
import HitCount from "../game/HitCount";
import TokenCount from "../game/TokenCount";

export default function TeamDisplay({ teamId }) {
  const teams = useSelector((state) => state.game.teams ?? []);

  const team = teams.find((t) => t.id === teamId) ?? null;

  return (
    <div className="team-display">
      <h1 style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>{team ? team.name : ""}</h1>

      <HitCount teamId={teamId} />

      <TokenCount teamId={teamId} />
    </div>
  );
}
