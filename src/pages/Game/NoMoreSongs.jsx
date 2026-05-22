import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import TeamDisplay from "../../features/team/TeamDisplay";
import DetailedTimeline from "../../features/timeline/DetailedTimeline";

export default function NoMoreSongs() {
  const navigate = useNavigate();

  const teams = useSelector((state) => state.game.teams ?? []);

  return (
    <div className="game" style={{ textAlign: "center", display: "flex", flexFlow: "column", gap: "1rem", minHeight: "100%" }}>
      <div style={{ margin: "auto" }}>
        <h1 style={{ marginBottom: "1rem" }}>No more songs, the game has ended.</h1>
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
