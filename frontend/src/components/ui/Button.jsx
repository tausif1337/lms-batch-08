import { cn } from "../../lib/cn.js";
import Spinner from "./Spinner.jsx";

const BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-150 " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-55";

const VARIANTS = {
  primary:
    "bg-primary text-primary-fg shadow-card hover:bg-primary-hover active:bg-primary-active",
  secondary:
    "border border-line bg-surface text-content shadow-card hover:border-line-strong hover:bg-surface-muted",
  ghost: "text-content-muted hover:bg-surface-muted hover:text-content",
  soft: "bg-primary-soft text-primary-on-soft hover:brightness-95",
  danger: "bg-danger text-white shadow-card hover:bg-danger-hover dark:text-danger-soft",
};

const SIZES = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
  icon: "h-9 w-9",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel,
  Icon,
  className = "",
  children,
  disabled,
  ref,
  ...rest
}) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {isLoading ? <Spinner /> : Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : null}
      {isLoading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
