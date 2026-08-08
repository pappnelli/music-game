"use client";

import { useToast } from "./use-toast";

export function Toaster() {
  const { message } = useToast();

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full border-2 border-primary bg-popover px-5 py-2.5 text-sm font-bold text-popover-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--primary),black_25%)] backdrop-blur-xl animate-in fade-in-0 slide-in-from-bottom-4">
      {message}
    </div>
  );
}
