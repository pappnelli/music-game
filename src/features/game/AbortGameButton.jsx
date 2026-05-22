import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import { abortGame } from "../../pages/Game/gameSlice";

export default function AbortGameButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div style={{ alignSelf: "center" }}>
      <Button
        onClick={() => {
          dispatch(abortGame());
          navigate("/");
        }}
        className="secondary-button"
      >
        End game
      </Button>
    </div>
  );
}
