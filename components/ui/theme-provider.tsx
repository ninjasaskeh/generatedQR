"use client";

import * as React from "react";
import {
  SpacemanThemeProvider,
  ThemeAnimationType,
} from "@space-man/react-theme-animation";

export function ThemeProvider({
  children,
  ...props
}: React.PropsWithChildren<Record<string, unknown>>) {
  // Map common props if present; fall back to sensible defaults
  const defaultTheme =
    (props?.defaultTheme as "light" | "dark" | "system" | undefined) ??
    "system";

  return (
    <SpacemanThemeProvider
      defaultTheme={defaultTheme}
      animationType={ThemeAnimationType.CIRCLE}
      duration={700}
    >
      {children}
    </SpacemanThemeProvider>
  );
}
