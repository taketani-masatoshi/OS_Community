"use client";

import { useEffect, type ReactNode } from "react";
import { applyThemePreference, readThemePreference } from "@/lib/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyThemePreference(readThemePreference());
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemePreference() === "system") applyThemePreference("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return children;
}
