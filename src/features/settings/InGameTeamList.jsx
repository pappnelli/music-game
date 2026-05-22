import { Pencil } from "lucide-react";
import { useSelector } from "react-redux";
import { useModal } from "../../contexts/useModal";
import ColorDisplay from "../../ui/ColorDisplay";
import IconButton from "../../ui/IconButton";
import EditTeamModal from "../../features/setup/EditTeamModal";

export default function InGameTeamList() {
  const { openModal } = useModal();

  const teams = useSelector((state) => state.game.teams ?? []);

  const handleEditTeam = (id) => {
    openModal(<EditTeamModal teamId={id} />);
  };

  return (
    <div className="settings-teams">
      {teams.map((team) => (
        <div key={team.id} className="settings-team">
          <ColorDisplay color={team.color} justDisplay={true} />

          <span className="team-name">{team.name}</span>

          <IconButton className="ghost" onClick={() => handleEditTeam(team.id)} title="Edit team">
            <Pencil size={16} />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
