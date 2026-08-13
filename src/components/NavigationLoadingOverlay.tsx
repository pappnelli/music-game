"use client";

import { Disc3 } from "lucide-react";

interface NavigationLoadingOverlayProps {
  message?: string;
}

export default function NavigationLoadingOverlay({ message = "Loading…" }: NavigationLoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Disc3 className="size-14 animate-[spin_1.4s_linear_infinite] text-primary" />
      <p className="text-sm font-bold tracking-wide text-muted-foreground uppercase">{message}</p>
    </div>
  );
}
