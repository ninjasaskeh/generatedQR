"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpacemanTheme } from "@space-man/react-theme-animation";

const ThemeToggle = () => {
  const { toggleTheme, ref } = useSpacemanTheme();

  return (
    <Button
      ref={ref as unknown as React.Ref<HTMLButtonElement>}
      variant="outline"
      size="icon"
      onClick={() => void toggleTheme()}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
};

export default ThemeToggle;
