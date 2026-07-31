"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { resetGame } from "@/lib/store/gameSlice";
import { Team } from "@/lib/store/gameSlice";

interface WinnerViewProps {
  winners: Team[];
}

export default function WinnerView({ winners }: WinnerViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isTie = winners.length > 1;

  const handleBackToHome = () => {
    dispatch(resetGame());
    router.push("/");
  };

  return (
    <div className="w-full flex justify-between">
      <h1 className="text-4xl font-black uppercase tracking-tight flex items-center justify-center gap-2 flex-wrap [text-shadow:0_0_10px_#ffffffa0]">
        {!isTie && <span>Team</span>}

        {winners.map((team, index) => (
          <span key={team.id} className="flex items-center gap-2">
            <div
              className="px-2 py-0.5 h-min rounded text-md uppercase font-mono border"
              style={{
                borderColor: team.color,
                color: team.color,
                backgroundColor: `${team.color}10`,
                boxShadow: `0 0 10px ${team.color}e0`,
              }}
            >
              {team.name}
            </div>
            {/* Döntetlen esetén 'and' vagy vessző elválasztás */}
            {isTie && index < winners.length - 1 && <span className="text-2xl font-bold text-muted-foreground">&</span>}
          </span>
        ))}

        <span>{isTie ? "tied!" : "won!"}</span>
      </h1>

      <button
        onClick={handleBackToHome}
        className="px-8 h-12 text-xs uppercase tracking-widest bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-app-black hover:shadow-[0_0_20px_var(--color-secondary)] transition-all duration-300 rounded-md"
      >
        Back to home
      </button>
    </div>
  );
}
