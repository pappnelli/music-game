import { useDispatch } from "react-redux";
import { drawNewCard } from "../../pages/Game/gameSlice";
import Button from "../../ui/Button";

export default function NewCardButton() {
  const dispatch = useDispatch();

  return (
    <Button
      onClick={() => {
        dispatch(drawNewCard());
      }}
      className="secondary-button"
    >
      New card
    </Button>
  );
}
