import { useSpotify } from "@/components/SpotifyPlayerProvider";
import { Song, Team, TokenPlacement, abortGame, drawNewCard, nextRound, setShowSolution } from "@/lib/store/gameSlice";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ActionsPanel from "./controldashboard/ActionsPanel";
import RoundSolutionMedia from "./controldashboard/RoundSolutionMedia";
import TeamsStatus from "./controldashboard/TeamsStatus";
import { Active } from "@dnd-kit/core";

interface RootState {
  game: {
    teams: Team[];
    currentTeamId: string | null;
    showSolution: boolean;
    cardPosition: number | null;
    tokens: TokenPlacement[];
    currentSong: Song | null;
    qrImage: string | null;
    accessToken: string | null;
    status: string;
    musicMode: "qr" | "spotify";
  };
  spotify: {
    accessToken: string | null;
  };
}

interface ControlDashboardProps {
  active: Active | null; // dnd-kit aktív vonszolt elem
}

export default function ControlDashboard({ active }: ControlDashboardProps) {
  const { data: session } = useSession();
  const { deviceId } = useSpotify();

  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const teams = useSelector((state: RootState) => state.game.teams ?? []);
  const currentTeamId = useSelector((state: RootState) => state.game.currentTeamId);
  const showSolution = useSelector((state: RootState) => state.game.showSolution);
  const cardPosition = useSelector((state: RootState) => state.game.cardPosition);
  const usedTokens = useSelector((state: RootState) => state.game.tokens ?? []);
  const currentSong = useSelector((state: RootState) => state.game.currentSong);
  const musicMode = useSelector((state: RootState) => state.game.musicMode);

  const spotifyId = currentSong?.spotifyId?.split("/").pop()?.split("?")[0];
  const spotifyUrl = currentSong?.spotifyId;
  const accessToken = (session as any)?.accessToken;

  const currentIndex = teams.findIndex((t) => t.id === currentTeamId);
  const reorderedTeams = [...teams.slice(currentIndex), ...teams.slice(0, currentIndex)];

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

  const handleAbortGame = () => {
    dispatch(abortGame());
    router.push("/");
  };

  return (
    <div className="w-full grid grid-cols-8 gap-4">
      {/* 1. OSZLOP: Többi csapat áttekintése */}
      <div className="col-span-8 lg:col-span-4 bg-card border border-border rounded-2xl p-4 place-content-center shadow-[var(--shadow-glow)]">
        <TeamsStatus
          teams={reorderedTeams}
          currentTeamId={currentTeamId}
          cardPosition={cardPosition}
          showSolution={showSolution}
          usedTokens={usedTokens}
          active={active}
        />
      </div>

      {/* 2. OSZLOP: QR Kód / Megoldás kijelző */}
      <div className="col-span-8 sm:col-span-8 lg:col-span-4 flex gap-3 bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-glow)]">
        <RoundSolutionMedia showSolution={showSolution} spotifyId={spotifyUrl} currentSong={currentSong} />

        <ActionsPanel
          showSolution={showSolution}
          currentSong={currentSong}
          cardPosition={cardPosition}
          teams={reorderedTeams}
          usedTokens={usedTokens}
          currentTeamId={currentTeamId}
          selectedTeamId={selectedTeamId}
          setSelectedTeamId={setSelectedTeamId}
          onPlay={handlePlayMusic}
          onDrawNew={handleDrawNewCard}
          onReveal={handleReveal}
          onNextRound={handleNextRound}
          onAbort={handleAbortGame}
        />
      </div>
    </div>
  );
}
