"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 h-14 px-8 border border-secondary text-secondary hover:bg-secondary hover:text-app-black hover:shadow-[0_0_15px_var(--color-secondary)] transition-all duration-300 font-mono uppercase tracking-widest"
    >
      Back
    </Button>
  );
}
