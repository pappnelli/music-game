"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ErrorClient() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold">Something went wrong.</h1>
      <p className="text-muted-foreground max-w-md">
        An unexpected error occurred during the game. You can go back to the home
        screen and start a new game.
      </p>
      <Button onClick={() => router.push("/")}>
        Back to home
      </Button>
    </div>
  );
}
