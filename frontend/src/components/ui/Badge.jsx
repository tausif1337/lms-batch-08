import { cn } from "../../lib/cn.js";

const TONES = {
  neutral: "bg-surface-muted text-content-muted ring-line",
  brand: "bg-primary-soft text-primary-on-soft ring-primary/20",
  success: "bg-success-soft text-success ring-success/25",
  danger: "bg-danger-soft text-danger ring-danger/25",
  warning: "bg-warning-soft text-warning ring-warning/25",
  info: "bg-info-soft text-info ring-info/25",
};

export default function Badge({ tone = "neutral", className = "", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
