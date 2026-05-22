import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import IconButton from "./IconButton";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <IconButton
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        zIndex: 1000,
      }}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </IconButton>
  );
}
