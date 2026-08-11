"use client";

import { abortGame, moveCard, moveToken, placeCard, placeToken } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { Active, DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import GameplayTimeline from "./components/GameplayTimeline";

import AppBackground from "@/components/AppBackground";
import { Button } from "@/components/ui/button";
import Disc from "@/components/Disc";
import ThemeToggle from "@/components/ThemeToggle";
import { LogOut, Settings } from "lucide-react";
import ActionsPanel from "./components/controldashboard/ActionsPanel";
import RoundSolutionMedia from "./components/controldashboard/RoundSolutionMedia";
import TeamsStatus from "./components/controldashboard/TeamsStatus";
import GameSettingsDialog from "./components/GameSettingsDialog";
import Token from "./components/Token";

export default function GameClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { teams, status, currentTeamId, musicMode, tokens, cardPosition, showSolution, currentSong } = useAppSelector((s) => s.game);

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

  const currentIndex = teams.findIndex((t) => t.id === currentTeamId);
  const reorderedTeams = [...teams.slice(currentIndex), ...teams.slice(0, currentIndex)];

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

  const handleAbortGame = () => {
    dispatch(abortGame());
    router.push("/");
  };

  if (status === "idle" || status === "finished" || status === "aborted") {
    return null;
  }

  return (
    <>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="relative flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
          <AppBackground />

          <header className="flex items-center justify-between gap-3 border-b-2 border-border px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2">
              <Disc size={22} spin shadow="0 1px 0 0 color-mix(in oklch, var(--primary), black 30%)" />
              <h1 className="text-base font-black tracking-tight text-foreground sm:text-lg">Music Game</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Game settings">
                <Settings className="size-5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAbortGame}
                aria-label="End session"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-5" />
              </Button>

              <ThemeToggle />
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4 lg:overflow-hidden">
            <div className="flex h-36 shrink-0 items-center overflow-x-auto rounded-2xl border-2 border-primary/25 bg-card/60 px-4 shadow-[0_4px_0_0_var(--border)] sm:h-40">
              <GameplayTimeline teamId={currentTeamId} active={active} />
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:overflow-hidden">
              <div className="min-h-0 min-w-0 flex-1 lg:h-full">
                <TeamsStatus
                  teams={reorderedTeams}
                  currentTeamId={currentTeamId}
                  cardPosition={cardPosition}
                  showSolution={showSolution}
                  usedTokens={tokens}
                  active={active}
                />
              </div>

              <div className="min-h-0 lg:h-full lg:w-60 lg:shrink-0">
                <RoundSolutionMedia
                  showSolution={showSolution}
                  currentSong={currentSong}
                  teamColor={teams.find((t) => t.id === currentTeamId)?.color}
                />
              </div>

              <div className="min-h-0 lg:h-full lg:w-60 lg:shrink-0">
                <ActionsPanel
                  showSolution={showSolution}
                  currentSong={currentSong}
                  cardPosition={cardPosition}
                  teams={reorderedTeams}
                  usedTokens={tokens}
                  currentTeamId={currentTeamId}
                />
              </div>
            </div>
          </main>
        </div>

        <DragOverlay dropAnimation={null}>
          {active && (
            <div className="pointer-events-none scale-110 rotate-3 opacity-90 drop-shadow-2xl transition-transform">
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
