"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ErrorClient() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center [animation:pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
      <span className="flex size-16 items-center justify-center rounded-full border-2 border-secondary bg-secondary/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--secondary),black_25%)]">
        <AlertTriangle className="size-8 text-secondary [animation:wiggle_2s_ease-in-out_infinite]" />
      </span>

      <div className="flex max-w-sm flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Something went wrong</h1>
        <p className="text-sm font-medium text-muted-foreground">
          An unexpected error interrupted the game. Head back to the home screen and start fresh.
        </p>
      </div>

      <Button type="button" size="lg" onClick={() => router.push("/")} className="transition-transform hover:scale-[1.02]">
        <Home className="size-4" />
        Back to Home
      </Button>
    </div>
  );
}
