"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

let theme: Theme = "light";
const listeners = new Set<() => void>();

function getTheme(): Theme {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("nova-theme");
    if (stored === "dark" || stored === "light") theme = stored;
  }
  return theme;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = useSyncExternalStore<Theme>(subscribe, getTheme, () => "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", current === "dark");
  }, [current]);

  function toggle() {
    theme = current === "dark" ? "light" : "dark";
    window.localStorage.setItem("nova-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    emit();
  }

  return (
    <ThemeContext.Provider value={{ theme: current, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
