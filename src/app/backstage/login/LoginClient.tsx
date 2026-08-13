"use client";

import AppBackground from "@/components/AppBackground";
import Disc from "@/components/Disc";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

interface LoginClientProps {
  nextPath: string;
}

export default function LoginClient({ nextPath }: LoginClientProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/backstage/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Something went wrong.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <AppBackground />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 [animation:pop-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
        <span className="relative flex size-16 items-center justify-center rounded-3xl border-2 border-secondary bg-secondary/10 shadow-[0_5px_0_0_color-mix(in_oklch,var(--secondary),black_30%)]">
          <Disc size={38} colorA="var(--secondary)" colorB="var(--primary)" shadow="none" />
        </span>

        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Backstage</h1>
          <p className="mt-1.5 text-sm font-semibold text-muted-foreground">Enter the password to edit the song catalog.</p>
        </div>

        <Card className="w-full p-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="backstage-password" className="gap-1.5">
                <KeyRound className="size-4 text-secondary" />
                Password
              </Label>
              <Input
                id="backstage-password"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!error}
              />
              {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={!password || isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              {isSubmitting ? "Checking…" : "Enter"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
