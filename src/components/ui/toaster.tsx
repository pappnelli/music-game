"use client";

import { useToast } from "./use-toast";

export function Toaster() {
  const { message } = useToast();

  if (!message) return null;

  return <div className="fixed bottom-4 right-4 bg-app-black text-app-white px-4 py-2 rounded shadow-lg">{message}</div>;
}
