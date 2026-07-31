import { Song } from "@/lib/store/gameSlice";
import QRCodeDisplay from "./QRCodeDisplay";
import SongCard from "../gameplaytimeline/SongCard";

interface RoundSolutionMediaProps {
  showSolution: boolean;
  spotifyId?: string;
  currentSong: Song | null;
}

export default function RoundSolutionMedia({ showSolution, spotifyId, currentSong }: RoundSolutionMediaProps) {
  return (
    <div className="h-full flex flex-col flex-1 items-center justify-center">
      {!showSolution ? (
        // <QRCodeDisplay spotifyId={spotifyId} />
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <span className="text-xs font-mono text-foreground/70 uppercase tracking-widest text-center">Scan for Audio</span>
          <QRCodeDisplay spotifyId={spotifyId} />
        </div>
      ) : (
        currentSong && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-[0.2em] opacity-80">[SYSTEM_REVEAL]</span>

            <SongCard song={currentSong} />
          </div>
        )
      )}
    </div>
  );
}
