"use client";

import { Button } from "@/components/ui/button";
import { resetGame } from "@/lib/store/gameSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { useAppNavigate } from "@/lib/useAppNavigate";
import { Home, ListMusic } from "lucide-react";

export default function NoSongsView() {
  const navigate = useAppNavigate();
  const dispatch = useAppDispatch();

  const handleBackToHome = () => {
    dispatch(resetGame());
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-border bg-card/60 p-8 text-center [animation:pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
      <span className="flex size-16 items-center justify-center rounded-full border-2 border-border bg-muted/40 [animation:token-float_3.5s_ease-in-out_infinite]">
        <ListMusic className="size-8 text-muted-foreground" />
      </span>

      <div>
        <h1 className="text-xl font-black text-foreground">Out of songs!</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">The catalog ran dry before anyone reached the win condition.</p>
      </div>

      <Button type="button" size="lg" onClick={handleBackToHome} className="transition-transform hover:scale-[1.02]">
        <Home className="size-4" />
        Back to Home
      </Button>
    </div>
  );
}
