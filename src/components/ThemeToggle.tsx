"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Microtask használatával elkerüljük a szinkron setState linter hibát
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    // Reserve the icon button's footprint to avoid layout shift while the theme resolves
    return <div className="size-10 shrink-0" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-card text-foreground shadow-sm transition-all hover:border-primary hover:bg-primary/10 active:scale-90"
    >
      {theme === "dark" ? <Sun className="size-5 text-accent" /> : <Moon className="size-5 text-secondary" />}
    </button>
  );
}
