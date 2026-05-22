import { useDispatch, useSelector } from "react-redux";
import { setShowSolution } from "../../pages/Game/gameSlice";
import Button from "../../ui/Button";

export default function ShowAnswerButton() {
  const dispatch = useDispatch();

  const cardPosition = useSelector((state) => state.game.cardPosition);

  return (
    <Button disabled={cardPosition === null} onClick={() => dispatch(setShowSolution(true))} style={{ fontSize: "16px" }}>
      Reveal the card
    </Button>
  );
}
