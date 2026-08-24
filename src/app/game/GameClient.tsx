"use client";

import { abortGame, moveCard, moveToken, placeCard, placeToken } from "@/lib/store/gameSlice";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useAppNavigate } from "@/lib/useAppNavigate";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import {
  Active,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
import Token, { TokenGhost } from "./components/Token";

/** A team's steal token "armed" for click-to-place, as an alternative to dragging it.
 * `fromPosition` is set when picking an already-placed token back up to move it. */
export interface SelectedToken {
  teamId: string;
  fromPosition?: number;
}

/** The mystery guessing card "armed" for click-to-place, as an alternative to dragging it.
 * `fromPosition` is set when picking the already-placed card back up to move it; undefined means
 * it's still unplaced and this is its first placement. */
export interface SelectedCard {
  fromPosition?: number;
}

export default function GameClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigate = useAppNavigate();
  const dispatch = useAppDispatch();

  const { teams, status, currentTeamId, musicMode, tokens, cardPosition, showSolution, currentSong } = useAppSelector((s) => s.game);
  const isPlaybackActive = searchParams.get("playback") === "active";

  // Default PointerSensor has no activation threshold, so a plain click was being read as a
  // zero-distance drag (briefly "picks up" the token, finds nothing to drop on, snaps back) and
  // the native click never reached our onClick handlers. Requiring 8px of movement before a drag
  // actually starts lets a stationary click pass through as a real click, while an intentional
  // drag still activates normally past that threshold.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (status === "finished") {
      navigate("/end", "Tallying the results…");
    } else if (status === "idle") {
      navigate("/setup");
    } else if (status === "aborted") {
      navigate("/");
    } else if (musicMode === "spotify" && !isPlaybackActive) {
      // Same-page query update, not a page navigation — no loading screen needed.
      // Guarded by isPlaybackActive so this can't re-fire into a navigate loop.
      router.push("/game?playback=active");
    }
  }, [status, router, navigate, musicMode, isPlaybackActive]);

  const [active, setActive] = useState<Active | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Click-to-place alternative to dragging a steal token: arm it, then click a slot to drop it
  // there. Cancelled by clicking anywhere that isn't a token or a slot (see the effect below).
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);

  // Same click-to-place pattern, for the mystery guessing card. Mutually exclusive with
  // selectedToken -- arming one disarms the other.
  const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);

  // While something is armed, a floating copy follows the cursor (see the effect below) and only
  // the slot the cursor is actually over lights up -- the second click mimics a real drop instead
  // of every legal slot lighting up at once.
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);

  // Tracked continuously (not just while armed) purely so the arming click itself -- which
  // doesn't generate its own pointermove -- has a known position to seed the ghost with
  // immediately, instead of it only appearing once the cursor first moves afterward.
  const lastPointerPosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function trackPointer(event: PointerEvent) {
      lastPointerPosition.current = { x: event.clientX, y: event.clientY };
    }

    document.addEventListener("pointermove", trackPointer);
    return () => document.removeEventListener("pointermove", trackPointer);
  }, []);

  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineFadeStyle = useEdgeFadeStyle(timelineRef, "x");

  const currentIndex = teams.findIndex((t) => t.id === currentTeamId);
  const reorderedTeams = [...teams.slice(currentIndex), ...teams.slice(0, currentIndex)];

  useEffect(() => {
    if (!selectedToken && !selectedCard) return;

    // Anything wearing data-token-ui (a token or a slot) handles its own click -- this only
    // needs to catch genuine clicks elsewhere (background, buttons, other cards, ...).
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-token-ui]")) {
        setSelectedToken(null);
        setSelectedCard(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [selectedToken, selectedCard]);

  // Floating ghost tracks the cursor for as long as something is armed -- purely visual, the
  // ghost itself has no drop logic (see TokenGhost).
  useEffect(() => {
    if (!selectedToken && !selectedCard) {
      setPointerPosition(null);
      return;
    }

    // Seed it right away from the last tracked position -- the click that armed this didn't fire
    // its own pointermove, so without this the ghost would stay invisible until the cursor moves.
    setPointerPosition(lastPointerPosition.current);

    function handlePointerMove(event: PointerEvent) {
      setPointerPosition({ x: event.clientX, y: event.clientY });
    }

    document.addEventListener("pointermove", handlePointerMove);
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, [selectedToken, selectedCard]);

  function handleTokenArm(teamId: string, fromPosition?: number) {
    setSelectedCard(null);
    setHoveredSlotIndex(null);
    setSelectedToken((current) => (current?.teamId === teamId ? null : { teamId, fromPosition }));
  }

  function handleCardArm(fromPosition?: number) {
    setSelectedToken(null);
    setHoveredSlotIndex(null);
    setSelectedCard((current) => (current ? null : { fromPosition }));
  }

  function handleSlotClick(index: number) {
    if (selectedToken) {
      const { teamId, fromPosition } = selectedToken;
      setSelectedToken(null);
      setHoveredSlotIndex(null);

      if (fromPosition === index) return; // clicking its own current slot just cancels the pickup

      // Same gate handleDragEnd uses for a token drop -- can't land on the guessing card's slot
      // or a slot any team (including this one) already occupies.
      if (index === cardPosition || tokens.some((t) => t.position === index)) return;

      if (fromPosition === undefined) {
        dispatch(placeToken({ teamId, position: index }));
      } else {
        dispatch(moveToken({ teamId, newPosition: index }));
      }
      return;
    }

    if (selectedCard) {
      const { fromPosition } = selectedCard;
      setSelectedCard(null);
      setHoveredSlotIndex(null);

      if (fromPosition === index) return; // clicking its own current slot just cancels the pickup

      // Same gate handleDragEnd uses for a card drop -- can't land on a slot any team's token
      // already occupies.
      if (tokens.some((t) => t.position === index)) return;

      if (fromPosition === undefined) {
        dispatch(placeCard({ position: index }));
      } else {
        dispatch(moveCard({ newPosition: index }));
      }
    }
  }

  function handleDragStart(event: DragStartEvent) {
    document.body.style.cursor = "grabbing";
    setActive(event.active);
    setSelectedToken(null);
    setSelectedCard(null);
    setHoveredSlotIndex(null);
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
    navigate("/");
  };

  if (status === "idle" || status === "finished" || status === "aborted") {
    return null;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // Horizontal auto-scroll threshold at 0 disables it entirely -- dragging a token near the
        // left/right edge shouldn't pan the teams list or the timeline sideways. Vertical stays at
        // dnd-kit's default so the page can still auto-scroll down on small screens.
        autoScroll={{ threshold: { x: 0, y: 0.2 } }}
      >
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
            <div className="h-36 shrink-0 overflow-hidden rounded-2xl border-2 border-primary/25 bg-card/60 shadow-[0_4px_0_0_var(--border)] sm:h-40">
              <div
                ref={timelineRef}
                style={timelineFadeStyle}
                className="flex h-full items-center overflow-x-auto px-4 pb-3"
              >
                <GameplayTimeline
                  teamId={currentTeamId}
                  active={active}
                  selectedToken={selectedToken}
                  selectedCard={selectedCard}
                  hoveredSlotIndex={hoveredSlotIndex}
                  onTokenClick={handleTokenArm}
                  onCardClick={handleCardArm}
                  onSlotClick={handleSlotClick}
                  onSlotHover={setHoveredSlotIndex}
                />
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:overflow-hidden">
              <div className="min-h-0 min-w-0 flex-1 lg:h-auto lg:mb-1.5">
                <TeamsStatus
                  teams={reorderedTeams}
                  currentTeamId={currentTeamId}
                  cardPosition={cardPosition}
                  showSolution={showSolution}
                  usedTokens={tokens}
                  active={active}
                  selectedToken={selectedToken}
                  selectedCard={selectedCard}
                  onTokenClick={handleTokenArm}
                  onCardClick={handleCardArm}
                />
              </div>

              <div className="min-h-0 lg:h-auto lg:mb-1.5 lg:w-60 lg:shrink-0">
                <RoundSolutionMedia
                  showSolution={showSolution}
                  currentSong={currentSong}
                  teamColor={teams.find((t) => t.id === currentTeamId)?.color}
                />
              </div>

              <div className="min-h-0 lg:h-auto lg:mb-1.5 lg:w-60 lg:shrink-0">
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

      {/* Click-to-place ghost -- follows the cursor while a token/card is armed, centered directly
          on it like it's being held right at the cursor rather than trailing below it. */}
      {(selectedToken || selectedCard) && pointerPosition && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 scale-110 rotate-3 opacity-90 drop-shadow-2xl [transition:transform_0.05s_linear]"
          style={{ left: pointerPosition.x, top: pointerPosition.y, transform: "translate(-50%, -50%)" }}
        >
          {selectedToken && <TokenGhost team={teams.find((t) => t.id === selectedToken.teamId)} type="token" />}
          {selectedCard && <TokenGhost team={teams.find((t) => t.id === currentTeamId)} type="guessing-card" />}
        </div>
      )}

      <GameSettingsDialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
