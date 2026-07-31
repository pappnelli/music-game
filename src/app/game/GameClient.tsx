"use client";

import { moveCard, moveToken, placeCard, placeToken } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { Active, DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ControlDashboard from "./components/ControlDashboard";
import GameplayTimeline from "./components/GameplayTimeline";
import StatusBar from "./components/StatusBar";

import Token from "./components/Token";
import GameSettingsDialog from "./components/GameSettingsDialog";
import { Settings } from "lucide-react";

export default function GameClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { teams, status, currentTeamId, musicMode, tokens, cardPosition } = useAppSelector((s) => s.game);

  useEffect(() => {
    if (status === "finished") {
      router.push("/end");
    } else if (status === "idle" || status === "aborted") {
      router.push("/setup");
    } else if (musicMode === "spotify") {
      router.push("/game?playback=active");
    }
  }, [status, router, musicMode]);

  const [active, setActive] = useState<Active | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  function handleDragStart(event: DragStartEvent) {
    document.body.style.cursor = "grabbing";
    setActive(event.active);
  }

  function handleDragEnd(event: DragEndEvent) {
    document.body.style.cursor = "default";
    const { active: eventActive, over } = event;

    // Az active állapot kiürítése azonnal
    setActive(null);

    if (!over) return;

    const targetSlot = over.data?.current;
    if (targetSlot?.type !== "slot") return;

    const slotIndex = targetSlot.index as number;
    const dragId = eventActive.id as string;

    if (slotIndex === cardPosition || tokens.some((t) => t.position === slotIndex)) return;

    // 1. Új kártya lehelyezése a timeline-ra
    if (dragId.startsWith("guessing-card")) {
      dispatch(placeCard({ position: slotIndex }));
      return;
    }

    // 2. Már lehelyezett kártya mozgatása a timeline-on belül
    if (dragId.startsWith("timeline-guessing-card")) {
      dispatch(moveCard({ newPosition: slotIndex }));
      return;
    }

    // 3. Új rabló token lehelyezése
    if (dragId.startsWith("token")) {
      const teamId = active?.data.current?.teamId;
      if (teamId) dispatch(placeToken({ teamId, position: slotIndex }));
      return;
    }

    // 4. Már lehelyezett rabló token mozgatása
    if (dragId.startsWith("timeline-token")) {
      const teamId = active?.data.current?.teamId;
      if (teamId) dispatch(moveToken({ teamId, newPosition: slotIndex }));
      return;
    }
  }

  if (status === "idle" || status === "finished" || status === "aborted") {
    return null;
  }

  return (
    <>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto min-h-screen">
          <div className="absolute top-4 right-4 z-11">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-md border border-border bg-app-black/40 hover:bg-secondary/20 transition-all duration-300 cursor-pointer"
              aria-label="Toggle Theme"
            >
              <Settings className="w-5 h-5 text-app-white" />
            </button>
          </div>

          <StatusBar active={active} />

          <GameplayTimeline teamId={currentTeamId} active={active} />

          <ControlDashboard active={active} />
        </div>

        <DragOverlay dropAnimation={null}>
          {active && (
            <div className="opacity-90 scale-105 pointer-events-none drop-shadow-xl transition-transform duration-75">
              {active.data.current?.type === "guessing-card" && <Token team={teams.find((t) => t.id === currentTeamId)} />}

              {active.data.current?.type === "token" && <Token team={teams.find((t) => t.id === active.data.current?.teamId)} />}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <GameSettingsDialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
