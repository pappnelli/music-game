"use client";

import AppBackground from "@/components/AppBackground";
import { Button } from "@/components/ui/button";
import { useAppNavigate } from "@/lib/useAppNavigate";
import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const navigate = useAppNavigate();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-5 overflow-hidden px-6 text-center">
      <AppBackground />

      <span className="relative z-10 flex size-16 items-center justify-center rounded-full border-2 border-secondary bg-secondary/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--secondary),black_25%)]">
        <AlertTriangle className="size-8 text-secondary [animation:wiggle_2s_ease-in-out_infinite]" />
      </span>

      <div className="relative z-10 flex max-w-sm flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Something went wrong</h1>
        <p className="text-sm font-medium text-muted-foreground">
          An unexpected error interrupted the game. Try again, or head back to the home screen.
        </p>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" size="lg" variant="outline" onClick={() => reset()} className="transition-transform hover:scale-[1.02]">
          <RotateCw className="size-4" />
          Try Again
        </Button>

        <Button type="button" size="lg" onClick={() => navigate("/")} className="transition-transform hover:scale-[1.02]">
          <Home className="size-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
