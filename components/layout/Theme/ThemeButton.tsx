"use client";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

const ThemeButton = () => {
  const { setTheme, theme } = useTheme();

  // if the system theme is changed, this will force a re-render
  // to update the theme icon
  React.useEffect(() => {
    const handleChange = () => {
      // force a re-render
      setTheme("system");
    };
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleChange);
    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleChange);
    };
  }, [setTheme]);


  return (
    <Button
      variant='outline'
      className='rounded-full'
      size='icon'
      onClick={() => {
        if (theme === "light") {
          setTheme("dark");
        } else {
          setTheme("light");
        }
      }}
    >
      <Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
      <Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
};

export default ThemeButton;
