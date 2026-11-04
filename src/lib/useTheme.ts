import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem("wix-chatgpt-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("wix-chatgpt-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  return { theme, setTheme, toggle };
}

/** Landing page is light-only; call this so the ChatGPT theme doesn't leak into it. */
export function useForceLight() {
  useEffect(() => {
    const prev = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "light");
    return () => {
      if (prev) document.documentElement.setAttribute("data-theme", prev);
    };
  }, []);
}
