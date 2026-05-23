import { useDispatch } from "react-redux";
import { drawNewCard } from "../../pages/Game/gameSlice";
import Button from "../../ui/Button";
import { RotateCw } from "lucide-react";

export default function NewCardButton() {
  const dispatch = useDispatch();

  return (
    <Button
      onClick={() => {
        dispatch(drawNewCard());
      }}
      className="secondary-button icon-button"
      style={{ width: "fit-content" }}
    >
      <RotateCw size={16} />
    </Button>
  );
}
