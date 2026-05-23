import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AbortGameButton from "../../features/game/AbortGameButton";
import QRCodeDisplay from "../../features/guess/QRCodeDisplay";
import ShowAnswerButton from "../../features/guess/ShowAnswerButton";
import AnswerDisplay from "../../features/reveal/AnswerDisplay";
import NextHitButton from "../../features/reveal/NextHitButton";
import RoundWinner from "../../features/reveal/RoundWinner";
import TokenWinner from "../../features/reveal/TokenWinner";
import GuessingCardDisplay from "../../features/team/GuessingCardDisplay";
import TeamDisplay from "../../features/team/TeamDisplay";
import DetailedTimeline from "../../features/timeline/DetailedTimeline";
import SimpleTimeline from "../../features/timeline/SimpleTimeline";
import NoMoreSongs from "./NoMoreSongs";
import WinnerScreen from "./WinnerScreen";
import { moveCard, moveToken, placeCard, placeToken } from "./gameSlice";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import GuessingCard from "../../features/game/GuessingCard";
import Token from "../../features/game/Token";
import NewCardButton from "../../features/guess/NewCardButton";
import StartMusicButton from "../../features/guess/StartMusicButton";
import { useSpotifyPlayer } from "../../contexts/useSpotifyPlayer";
import { startSpotifyPlayback } from "../../utils/spotifyPlayback";

export default function GamePage() {
  const dispatch = useDispatch();

  const teams = useSelector((state) => state.game.teams ?? []);
  const currentTeamId = useSelector((state) => state.game.currentTeamId);
  const currentSong = useSelector((state) => state.game.currentSong ?? null);
  const songs = useSelector((state) => state.game.songs ?? []);
  const status = useSelector((state) => state.game.status);
  const showSolution = useSelector((state) => state.game.showSolution);
  const winnerId = useSelector((state) => state.game.winnerId);
  // const musicMode = useSelector((state) => state.game.musicMode);

  const [qrImage, setQrImage] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [active, setActive] = useState(null);

  const currentIndex = teams.findIndex((t) => t.id === currentTeamId);

  const rotatedTeams = currentIndex >= 0 ? [...teams.slice(currentIndex), ...teams.slice(0, currentIndex)] : teams;

  const accessToken = localStorage.getItem("spotify_access_token");
  const { deviceId } = useSpotifyPlayer();

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (!currentSong?.spotify_url) {
        setQrImage(null);
        return;
      }

      const img = await QRCode.toDataURL(currentSong.spotify_url);
      if (!cancelled) setQrImage(img);
    }

    generate();
    return () => {
      cancelled = true;
    };
  }, [currentSong]);

  useEffect(() => {
    console.log("Current song changed:", currentSong);
    if (!currentSong) return;
    if (!deviceId) return;

    const trackId = currentSong.spotify_url?.split("/track/")[1]?.split("?")[0];

    if (!trackId) return;

    startSpotifyPlayback({
      deviceId,
      trackId,
      accessToken,
    });
  }, [currentSong, deviceId]);

  function handleDragEnd(event) {
    document.body.style.cursor = "default";

    const teamId = active.data.current?.teamId;

    const { active: eventActive, over } = event;
    setActive(null);

    if (!over) return;

    const targetSlot = over.data?.current;
    if (targetSlot?.type !== "slot") return;

    if (eventActive?.id === "guessing-card") {
      dispatch(placeCard({ position: targetSlot.index }));
      return;
    }

    if (eventActive?.id === "timeline-guessing-card") {
      dispatch(moveCard({ newPosition: targetSlot.index }));
      return;
    }

    if (eventActive?.id?.startsWith("token")) {
      dispatch(placeToken({ teamId: eventActive.data.current.teamId, position: targetSlot.index }));
      return;
    }

    if (eventActive?.id?.startsWith("timeline-token")) {
      dispatch(moveToken({ teamId: teamId, newPosition: targetSlot.index }));
      return;
    }
  }

  function handleDragStart(event) {
    document.body.style.cursor = "grabbing";

    setActive(event.active);
  }

  if (status === "idle") {
    throw new Error("No game to load. Start a new one from the Setup page!");
  }

  if (songs.length === 0 && status === "aborted") {
    return <NoMoreSongs />;
  }

  if (winnerId && status === "finished") {
    return <WinnerScreen />;
  }

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div
        className="game"
        style={{
          display: "flex",
          flexFlow: "column",
          height: "100%",
          gap: "1rem",
        }}
      >
        <div className="first-row">
          <div style={{ minWidth: "400px" }}>
            <h2 style={{ marginBottom: "1rem" }}>Current team:</h2>
            <TeamDisplay teamId={currentTeamId} />
          </div>

          {!showSolution ? <GuessingCardDisplay active={active} /> : <RoundWinner />}
        </div>

        <div className="second-row">
          <DetailedTimeline teamId={currentTeamId} active={active} />

          <DragOverlay>
            {active?.id === "guessing-card" && <GuessingCard />}
            {active?.id === "timeline-guessing-card" && <GuessingCard />}
            {active?.id?.startsWith("token") && <Token color={teams.find((t) => t.id === active.data.current.teamId)?.color} />}
            {active?.id?.startsWith("timeline-token") && <Token color={teams.find((t) => t.id === active.data.current.teamId)?.color} />}
          </DragOverlay>
        </div>

        <div className="third-row">
          <div className="first-col">
            {rotatedTeams.map(
              (team) =>
                team.id !== currentTeamId && (
                  <div key={team.id}>
                    <TeamDisplay teamId={team.id} />
                    <SimpleTimeline teamId={team.id} />
                  </div>
                ),
            )}
          </div>

          <div className="second-col">
            {!showSolution ? (
              <QRCodeDisplay qrImage={qrImage} />
            ) : (
              currentSong && <AnswerDisplay year={currentSong.year} artist={currentSong.artist} title={currentSong.title} />
            )}
          </div>

          <div className="third-col">
            {currentSong &&
              (!showSolution ? (
                <div style={{ flex: 1, alignSelf: "center", display: "flex", flexFlow: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <StartMusicButton currentSong={currentSong} accessToken={accessToken} />

                    <NewCardButton />
                  </div>

                  <ShowAnswerButton />
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <TokenWinner selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} />

                  <NextHitButton selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} />
                </div>
              ))}

            <AbortGameButton />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
