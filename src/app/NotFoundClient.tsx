"use client";

import AppBackground from "@/components/AppBackground";
import { Button } from "@/components/ui/button";
import { useAppNavigate } from "@/lib/useAppNavigate";
import { Home, SearchX } from "lucide-react";

export default function NotFoundClient() {
  const navigate = useAppNavigate();

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-5 overflow-hidden px-6 text-center">
      <AppBackground />

      <span className="relative z-10 flex size-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary),black_25%)]">
        <SearchX className="size-8 text-primary [animation:wiggle_2s_ease-in-out_infinite]" />
      </span>

      <div className="relative z-10 flex max-w-sm flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">404</span> — Page not
          found
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          This track isn&apos;t in our catalog. Head back to the home screen to keep playing.
        </p>
      </div>

      <Button type="button" size="lg" onClick={() => navigate("/")} className="relative z-10 transition-transform hover:scale-[1.02]">
        <Home className="size-4" />
        Back to Home
      </Button>
    </div>
  );
}
