import { useSelector } from "react-redux";
import SimpleCard from "./SimpleCard";

export default function SimpleTimeline({ teamId }) {
  const teams = useSelector((state) => state.game.teams ?? []);

  const team = teams.find((t) => t.id === teamId) ?? null;
  const cards = team?.cards ?? [];

  const sorted = cards.slice().sort((a, b) => a.year - b.year);

  return (
    <div className="simple-timeline">
      {sorted.map((song, i) => (
        <SimpleCard key={i} year={song.year} />
      ))}
    </div>
  );
}
