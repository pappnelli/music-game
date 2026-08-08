import { Card } from "@/components/ui/card";
import { Song } from "@/lib/store/gameSlice";
import { Sparkles, Volume2 } from "lucide-react";
import SongCard from "../gameplaytimeline/SongCard";
import RoundWinner from "../statusbar/RoundWinner";
import QRCodeDisplay from "./QRCodeDisplay";

interface RoundSolutionMediaProps {
  showSolution: boolean;
  currentSong: Song | null;
  /** The current team's color, used to tint the QR panel while it's their turn. */
  teamColor?: string;
}

export default function RoundSolutionMedia({ showSolution, currentSong, teamColor }: RoundSolutionMediaProps) {
  const spotifyId = currentSong?.spotifyId;

  return (
    <Card className="h-full min-h-0 p-4">
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto text-center">
        {!showSolution ? (
          <>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-black tracking-wide text-primary uppercase">
              <Volume2 className="size-4 [animation:wiggle_1.6s_ease-in-out_infinite]" />
              Scan for audio
            </span>
            <QRCodeDisplay spotifyId={spotifyId} color={teamColor} />
          </>
        ) : (
          currentSong && (
            <>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-black tracking-wide text-accent uppercase">
                <Sparkles className="size-4" />
                Revealed
              </span>
              <SongCard song={currentSong} />
              <RoundWinner />
            </>
          )
        )}
      </div>
    </Card>
  );
}
