import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getTheme } from "../../lib/theme.js";
import { cn } from "../../lib/cn.js";

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      title={`Switch to ${nextTheme} mode`}
      aria-label={`Switch to ${nextTheme} mode`}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-content-muted transition hover:border-line-strong hover:text-content",
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
    </button>
  );
}
