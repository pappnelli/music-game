import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GamePage from "./pages/Game/GamePage";
import SetupPage from "./pages/Setup/SetupPage";
import "./styles/global.css";
import AppLayout from "./ui/AppLayout";
import Error from "./ui/Error";
import { ErrorBoundary } from "react-error-boundary";
import { NotificationProvider } from "./contexts/NotificationProvider";
import { ModalProvider } from "./contexts/ModalProvider";
import { SettingsProvider } from "./contexts/SettingsProvider";
import Callback from "./pages/Callback/Callback";
import { SpotifyPlayerProvider } from "./contexts/SpotifyPlayerProvider";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <SetupPage />,
        errorElement: <Error />,
      },
      {
        path: "/game",
        element: <GamePage />,
        errorElement: <Error />,
      },
      {
        path: "/callback",
        element: <Callback />,
        errorElement: <Error />,
      },
      {
        path: "*",
        element: <Error pageNotFound={true} />,
      },
    ],
  },
]);

export default function App() {
  return (
    <SpotifyPlayerProvider>
      <NotificationProvider>
        <SettingsProvider>
          <ModalProvider>
            <ErrorBoundary FallbackComponent={({ error }) => <Error error={error} />}>
              <RouterProvider router={router} />
            </ErrorBoundary>
          </ModalProvider>
        </SettingsProvider>
      </NotificationProvider>
    </SpotifyPlayerProvider>
  );
}
