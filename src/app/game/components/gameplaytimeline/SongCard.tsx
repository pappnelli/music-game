import { Song } from "@/lib/store/gameSlice";

interface SongCardProps {
  song: Song;
  size?: string;
}

export default function SongCard({ song, size = "large" }: SongCardProps) {
  const { year, artist, title } = song;

  if (size === "small") {
    return (
      <div
        className={`w-full max-w-[40px] min-w-[20px] aspect-square p-0.5 flex flex-col items-center justify-between rounded-xs overflow-hidden group border-1 border-primary ring-1 ring-app-white bg-app-black hover:scale-400 hover:z-5`}
      >
        <span className="text-[2px] text-center font-medium font-mono uppercase tracking-wider text-app-white/80 leading-tight line-clamp-2 w-full">
          {artist}
        </span>

        <span
          className="w-full text-center text-[8px] font-black tracking-tighter bg-gradient-to-t from-[#F05F1F] to-[#aefe8a] bg-clip-text text-transparent"
          style={{
            filter: "drop-shadow(0 0 10px rgba(174, 254, 138, 0.5))",
          }}
        >
          {year}
        </span>

        <span className="text-[2px] text-center font-medium font-mono uppercase tracking-wider text-app-white/80 leading-tight line-clamp-2 w-full">
          {title}
        </span>
      </div>
    );
  }

  if (size === "medium") {
    return (
      <div
        className={`w-full max-w-[120px] min-w-[60px] aspect-square p-0.5 flex flex-col items-center justify-between 
              rounded-sm overflow-hidden group border-1 border-primary ring-1 ring-app-white bg-app-black hover:scale-140 hover:z-5`}
      >
        <span className="text-[10px] text-center font-medium font-mono uppercase tracking-wider text-app-white/80 leading-tight line-clamp-2 w-full">
          {artist}
        </span>

        <span
          className="w-full text-center text-2xl font-black tracking-tighter bg-gradient-to-t from-[#F05F1F] to-[#aefe8a] bg-clip-text text-transparent"
          style={{
            filter: "drop-shadow(0 0 10px rgba(174, 254, 138, 0.5))",
          }}
        >
          {year}
        </span>

        <span className="text-[10px] text-center font-medium font-mono uppercase tracking-wider text-app-white/80 leading-tight line-clamp-2 w-full">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-[160px] min-w-[60px] aspect-square p-3 flex flex-col items-center justify-between 
              rounded-md overflow-hidden group border-2 border-primary ring-2 ring-app-white bg-app-black`}
    >
      <span className="text-xs text-center font-medium font-mono uppercase tracking-wider text-app-white/80 leading-tight line-clamp-2 w-full">
        {artist}
      </span>

      <span
        className="w-full text-center text-4xl font-black tracking-tighter bg-gradient-to-t from-[#F05F1F] to-[#aefe8a] bg-clip-text text-transparent"
        style={{
          filter: "drop-shadow(0 0 10px rgba(174, 254, 138, 0.5))",
        }}
      >
        {year}
      </span>

      <span className="text-xs text-center font-medium font-mono uppercase tracking-wider text-app-white/80 leading-tight line-clamp-2 w-full">
        {title}
      </span>
    </div>
  );
}
