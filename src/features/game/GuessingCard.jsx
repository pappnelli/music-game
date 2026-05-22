import { useSelector } from "react-redux";

export default function GuessingCard() {
  const currentTeamId = useSelector((state) => state.game.currentTeamId);
  const teams = useSelector((state) => state.game.teams ?? []);

  const team = teams.find((t) => t.id === currentTeamId) ?? null;
  const color = team?.color ?? null;

  return (
    <div className="guessing-card" style={{ border: `3px solid ${color}` }}>
      <div className="rainbow-circle" />
    </div>
  );
}
