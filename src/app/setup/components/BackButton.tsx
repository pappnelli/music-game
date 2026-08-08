"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <Button type="button" variant="outline" size="lg" onClick={onClick}>
      <ArrowLeft className="size-4" />
      Back
    </Button>
  );
}
