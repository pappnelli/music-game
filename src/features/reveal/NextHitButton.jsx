import { useDispatch } from "react-redux";
import { nextRound } from "../../pages/Game/gameSlice";
import Button from "../../ui/Button";

export default function NextHitButton({ selectedTeamId, setSelectedTeamId }) {
  const dispatch = useDispatch();

  return (
    <div style={{ alignSelf: "center" }}>
      <Button
        style={{ fontSize: "16px" }}
        onClick={() => {
          dispatch(
            nextRound({
              tokenWinnerId: selectedTeamId,
            }),
          );
          setSelectedTeamId(null);
        }}
      >
        Next song
      </Button>
    </div>
  );
}
