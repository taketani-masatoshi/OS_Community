"use client";

import { useEffect, useState } from "react";
import {
  applyThemePreference,
  readThemePreference,
  type ThemePreference,
} from "@/lib/theme";

type Labels = {
  legend: string;
  light: string;
  lightHint: string;
  dark: string;
  darkHint: string;
  system: string;
  systemHint: string;
};

const OPTIONS: Array<{
  value: ThemePreference;
  swatch: "light" | "dark" | "system";
  labelKey: "light" | "dark" | "system";
  hintKey: "lightHint" | "darkHint" | "systemHint";
}> = [
  { value: "light", swatch: "light", labelKey: "light", hintKey: "lightHint" },
  { value: "dark", swatch: "dark", labelKey: "dark", hintKey: "darkHint" },
  { value: "system", swatch: "system", labelKey: "system", hintKey: "systemHint" },
];

export function AppearancePicker({ labels }: { labels: Labels }) {
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    setPreference(readThemePreference());
  }, []);

  function select(next: ThemePreference) {
    setPreference(next);
    applyThemePreference(next);
  }

  return (
    <fieldset className="theme-picker">
      <legend className="theme-picker-legend">{labels.legend}</legend>
      {OPTIONS.map((option) => (
        <label key={option.value} className="theme-picker-option">
          <input
            type="radio"
            name="appearance"
            value={option.value}
            checked={preference === option.value}
            onChange={() => select(option.value)}
          />
          <span className={`theme-picker-swatch is-${option.swatch}`} aria-hidden="true" />
          <span className="theme-picker-copy">
            <strong>{labels[option.labelKey]}</strong>
            <span>{labels[option.hintKey]}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
