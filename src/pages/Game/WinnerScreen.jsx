import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import TeamDisplay from "../../features/team/TeamDisplay";
import DetailedTimeline from "../../features/timeline/DetailedTimeline";

export default function WinnerScreen() {
  const navigate = useNavigate();

  const teams = useSelector((state) => state.game.teams ?? []);
  const winnerId = useSelector((state) => state.game.winnerId);

  const winner = teams.find((t) => t.id === winnerId) ?? null;

  return (
    <div className="game" style={{ textAlign: "center", display: "flex", flexFlow: "column", gap: "1rem", minHeight: "100%" }}>
      <div style={{ margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <h1>Team&nbsp;</h1>
          <h1 style={{ color: winner?.color }}>{winner?.name}</h1>
          <h1>&nbsp;won.</h1>
        </div>
        <Button
          onClick={() => {
            navigate("/");
          }}
        >
          Back to home
        </Button>
      </div>
      <div style={{ display: "flex", flexFlow: "column", gap: "1rem", marginTop: "auto", marginBottom: "auto" }}>
        {teams.map((team) => (
          <div key={team.id} style={{ display: "flex", flexFlow: "column", gap: "0.5rem" }}>
            <TeamDisplay teamId={team.id} />
            <div className="second-row">
              <DetailedTimeline teamId={team.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
