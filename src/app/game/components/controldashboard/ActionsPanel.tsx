"use client";

import { TeamDisc } from "@/components/Disc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSpotify } from "@/components/SpotifyPlayerProvider";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { drawNewCard, nextRound, removeCard, removeToken, setShowSolution, Song, Team, TokenPlacement } from "@/lib/store/gameSlice";
import { TEAM_NAME_CLASS, teamNameGlowStyle } from "@/lib/teamColors";
import { useEdgeFadeStyle } from "@/lib/useEdgeFade";
import { Check, Eraser, Eye, LucideIcon, Play, Radio, Shuffle, SkipForward, Trophy } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ActionsPanelProps {
  showSolution: boolean;
  currentSong: Song | null;
  cardPosition: number | null;
  teams: Team[];
  usedTokens: TokenPlacement[];
  currentTeamId: string | null;
}

interface ActionTileProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function ActionTile({ icon: Icon, label, onClick, disabled }: ActionTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 border-border bg-card py-2 text-xs font-black tracking-wide text-muted-foreground uppercase shadow-[0_3px_0_0_var(--border)] transition-all hover:border-primary/50 hover:text-primary active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

export default function ActionsPanel({ showSolution, currentSong, cardPosition, teams, usedTokens, currentTeamId }: ActionsPanelProps) {
  const { data: session } = useSession();
  const { deviceId } = useSpotify();

  const dispatch = useDispatch();

  const musicMode = useSelector((state: RootState) => state.game.musicMode);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const actionsRef = useRef<HTMLDivElement>(null);
  const actionsFadeStyle = useEdgeFadeStyle(actionsRef, "y");
  const teamsRef = useRef<HTMLDivElement>(null);
  const teamsFadeStyle = useEdgeFadeStyle(teamsRef, "y");

  const spotifyId = currentSong?.spotifyId?.split("/").pop()?.split("?")[0];
  const accessToken = session?.accessToken;

  const handlePlayMusic = useCallback(async () => {
    if (!accessToken || !deviceId || !spotifyId) {
      console.log("Hiányzó feltételek: Token, DeviceID vagy SpotifyID!");
      return;
    }

    try {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          uris: [`spotify:track:${spotifyId}`],
        }),
      });
    } catch (error) {
      console.error("Hiba a zenelejátszás indításakor:", error);
    }
  }, [accessToken, deviceId, spotifyId]);

  useEffect(() => {
    if (spotifyId && musicMode === "spotify") {
      handlePlayMusic();
    }
  }, [handlePlayMusic, spotifyId, musicMode]);

  const handleDrawNewCard = () => {
    dispatch(drawNewCard());
  };

  const handleReveal = () => {
    dispatch(setShowSolution(true));
  };

  const handleNextRound = () => {
    dispatch(nextRound({ tokenWinnerId: selectedTeamId }));
    setSelectedTeamId(null);
  };

  if (!currentSong) return null;

  function handleReset() {
    usedTokens.map((token) => dispatch(removeToken({ teamId: token.teamId })));
    dispatch(removeCard());
    dispatch(setShowSolution(false));
  }

  const currentIdx = teams.findIndex((t) => t.id === currentTeamId);
  const rotatedTeams = currentIdx >= 0 ? [...teams.slice(currentIdx), ...teams.slice(0, currentIdx)] : teams;

  return (
    <Card className="flex h-full min-h-0 flex-col gap-3 p-3">
      <h2 className="flex shrink-0 items-center gap-2 px-1 text-xs font-black tracking-wide text-foreground uppercase">
        {showSolution ? <Trophy className="size-4 text-secondary" /> : <Radio className="size-4 text-primary" />}
        {showSolution ? "Bonus Token" : "Round Actions"}
      </h2>

      {!showSolution ? (
        <div
          ref={actionsRef}
          style={actionsFadeStyle}
          className="flex min-h-0 flex-1 flex-col justify-center gap-3 overflow-x-hidden overflow-y-auto"
        >
          <Button
            type="button"
            size="lg"
            disabled={cardPosition === null}
            onClick={handleReveal}
            className={cn("w-full shrink-0", cardPosition !== null && "[animation:invite-bounce_2.6s_ease-in-out_infinite]")}
          >
            <Eye className="size-5" />
            Reveal Answer
          </Button>

          <div className="flex shrink-0 items-stretch gap-2 mb-1">
            <ActionTile icon={Play} label="Play" onClick={handlePlayMusic} disabled={musicMode !== "spotify"} />
            <ActionTile icon={Shuffle} label="Swap" onClick={handleDrawNewCard} />
            <ActionTile icon={Eraser} label="Reset" onClick={handleReset} disabled={usedTokens?.length === 0} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-2.5">
          <span className="shrink-0 px-1 text-xs font-semibold text-muted-foreground">Who called it right?</span>

          <div
            ref={teamsRef}
            style={teamsFadeStyle}
            className="flex min-w-0 flex-1 flex-col gap-1.5 overflow-x-hidden overflow-y-auto pr-0.5"
          >
            {rotatedTeams.map((team, i) => {
              const isSelected = selectedTeamId === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
                  aria-pressed={isSelected}
                  style={
                    isSelected
                      ? {
                          borderColor: team.color,
                          backgroundColor: `color-mix(in oklch, ${team.color}, transparent 88%)`,
                          boxShadow: `0 3px 0 0 color-mix(in oklch, ${team.color}, black 25%)`,
                        }
                      : undefined
                  }
                  className={cn(
                    "relative flex w-full min-w-0 shrink-0 items-center gap-2 rounded-xl border-2 px-2.5 py-2 text-left text-xs font-bold transition-all",
                    !isSelected && "border-border bg-muted/30 opacity-70 hover:opacity-100",
                    rotatedTeams.length - 1 === i && "mb-1"
                  )}
                >
                  <TeamDisc team={team} size={22} className="shrink-0" />
                  <span className={cn("min-w-0 flex-1 truncate", TEAM_NAME_CLASS)} style={teamNameGlowStyle(team.color)}>
                    {team.name}
                  </span>
                  {isSelected && (
                    <span
                      aria-hidden
                      className="flex size-4 shrink-0 items-center justify-center rounded-full text-white shadow"
                      style={{ backgroundColor: team.color }}
                    >
                      <Check className="size-2.5" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Button type="button" size="lg" onClick={handleNextRound} className="w-full shrink-0">
            Next Round
            <SkipForward className="size-5" />
          </Button>
        </div>
      )}
    </Card>
  );
}
