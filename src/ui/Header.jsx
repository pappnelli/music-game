import { useLocation } from "react-router-dom";
import InGameSettings from "./InGameSettings";
import ThemeSwitcher from "./ThemeSwitcher";

function Header() {
  const location = useLocation();
  const isGame = location.pathname === "/game";

  return (
    <header
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 0,
      }}
      className="header"
    >
      {isGame && <InGameSettings />}
      <ThemeSwitcher />
    </header>
  );
}

export default Header;
