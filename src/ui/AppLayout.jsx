import { Outlet } from "react-router-dom";
import Header from "./Header";

function AppLayout() {
  return (
    <div className="layout" style={{ height: "100%" }}>
      <Header />

      <main className="main" style={{ height: "100%", padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
