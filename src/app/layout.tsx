import { Providers } from "@/components/Providers";
import { ReduxProvider } from "@/components/ReduxProvider";
import { SpotifyPlayerProvider } from "@/components/SpotifyPlayerProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";
import "../styles/globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "Music Game",
  description: "A legjobb zenefelismerő játék a barátaidnak.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <ReduxProvider>
            <ToastProvider>
              <Providers>
                <SpotifyPlayerProvider>{children}</SpotifyPlayerProvider>
              </Providers>
              <Toaster />
            </ToastProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
