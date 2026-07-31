"use client"

import * as React from "react"
import { ToastProvider as RadixToastProvider, ToastViewport } from "@radix-ui/react-toast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixToastProvider>
      {children}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col gap-2 p-4" />
    </RadixToastProvider>
  )
}
