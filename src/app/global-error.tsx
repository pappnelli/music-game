"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { useEffect } from "react";
import "../styles/globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Catches errors thrown by the root layout itself (providers, theme, etc.).
// Next.js swaps out the whole document for this file when that happens, so
// it must render its own <html>/<body> and can't rely on the layout's
// providers -- a full navigation is used instead of the app's router.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6 text-center font-sans text-foreground antialiased">
        <span className="flex size-16 items-center justify-center rounded-full border-2 border-secondary bg-secondary/10 shadow-[0_4px_0_0_color-mix(in_oklch,var(--secondary),black_25%)]">
          <AlertTriangle className="size-8 text-secondary" />
        </span>

        <div className="flex max-w-sm flex-col gap-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Something went wrong</h1>
          <p className="text-sm font-medium text-muted-foreground">
            The app hit an unexpected error. Try again, or head back to the home screen.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" size="lg" variant="outline" onClick={() => reset()} className="transition-transform hover:scale-[1.02]">
            <RotateCw className="size-4" />
            Try Again
          </Button>

          <Button
            type="button"
            size="lg"
            onClick={() => (window.location.href = "/")}
            className="transition-transform hover:scale-[1.02]"
          >
            <Home className="size-4" />
            Back to Home
          </Button>
        </div>
      </body>
    </html>
  );
}
