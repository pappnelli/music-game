import { useSelector } from "react-redux";
import Button from "../../ui/Button";

export default function TokenWinner({ selectedTeamId, setSelectedTeamId }) {
  const teams = useSelector((state) => state.game.teams ?? []);
  const currentTeamId = useSelector((state) => state.game.currentTeamId);

  const currentIndex = teams.findIndex((t) => t.id === currentTeamId);

  const rotatedTeams = currentIndex >= 0 ? [...teams.slice(currentIndex), ...teams.slice(0, currentIndex)] : teams;

  return (
    <div className="token-winner">
      <h3 style={{ whiteSpace: "nowrap" }}>Did any team earn a token?</h3>

      {rotatedTeams.map((team) => (
        <Button
          key={team.id}
          className={`team ${selectedTeamId === team.id ? "selected-team" : ""}`}
          onClick={() => {
            if (selectedTeamId === team.id) {
              setSelectedTeamId(null);
            } else {
              setSelectedTeamId(team.id);
            }
          }}
        >
          {team.name}
        </Button>
      ))}
    </div>
  );
}
