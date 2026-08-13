import { NavigationLoadingProvider } from "@/components/NavigationLoadingProvider";
import { Providers } from "@/components/Providers";
import { ReduxProvider } from "@/components/ReduxProvider";
import { SpotifyPlayerProvider } from "@/components/SpotifyPlayerProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";
import "../styles/globals.css";

export const metadata = {
  title: "Music Game",
  description: "The ultimate music-guessing party game for you and your friends.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <NavigationLoadingProvider>
            <ReduxProvider>
              <ToastProvider>
                <Providers>
                  <SpotifyPlayerProvider>{children}</SpotifyPlayerProvider>
                </Providers>
                <Toaster />
              </ToastProvider>
            </ReduxProvider>
          </NavigationLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
