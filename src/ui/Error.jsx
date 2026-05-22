import { Frown } from "lucide-react";
import { useNavigate, useRouteError } from "react-router-dom";
import Button from "./Button";

export default function Error({ error: boundaryError, pageNotFound = false }) {
  const navigate = useNavigate();
  const routeError = useRouteError();

  const error = boundaryError || routeError;

  const message =
    error?.data || error?.error?.message || error?.message || (pageNotFound && "This page could not be found") || "Unknown error";

  return (
    <div style={{ paddingTop: "9rem", textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h2>Something went wrong&nbsp;</h2>
        <Frown size={26} color="var(--color-text)" />
      </div>
      <h1 style={{ marginBottom: "1rem" }}>{message}</h1>
      <Button onClick={() => navigate("/")}>Back to home</Button>
    </div>
  );
}
