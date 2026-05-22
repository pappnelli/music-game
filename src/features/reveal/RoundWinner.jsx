import { Frown, PartyPopper } from "lucide-react";
import { useSelector } from "react-redux";

export default function RoundWinner() {
  const roundWinnerId = useSelector((state) => state.game.roundWinnerId);
  const teams = useSelector((state) => state.game.teams ?? []);

  const winner = teams.find((t) => t.id === roundWinnerId) ?? null;
  const color = winner?.color ?? "#fff";

  return (
    <div className="round-winner">
      {roundWinnerId ? <h2 style={{ color: color }}>{winner.name}</h2> : <h2>No one</h2>}

      <h2>&nbsp;won the card&nbsp;</h2>

      {roundWinnerId ? <PartyPopper size={26} color={color} /> : <Frown size={26} />}
    </div>
  );
}
