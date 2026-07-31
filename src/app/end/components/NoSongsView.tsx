"use client";

import { resetGame } from "@/lib/store/gameSlice";
import { useAppDispatch } from "@/lib/store/hooks";
import { useRouter } from "next/navigation";

export default function NoSongsView() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleBackToHome = () => {
    dispatch(resetGame());
    router.push("/");
  };

  return (
    <div className="w-full flex justify-between">
      <h1 className="text-3xl font-black uppercase tracking-tight flex items-center justify-center gap-2 flex-wrap [text-shadow:0_0_10px_#ffffffa0]">
        No more songs, the game has ended.
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
