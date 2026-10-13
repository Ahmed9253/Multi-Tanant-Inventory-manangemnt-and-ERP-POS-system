import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("worknest-theme") || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("worknest-theme", theme);
  }, [theme]);
  const toggle = () => setTheme((current) => (current === "light" ? "dark" : "light"));
  return { theme, toggle } as const;
}
