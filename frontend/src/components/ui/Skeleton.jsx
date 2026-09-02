import { cn } from "../../lib/cn.js";

export default function Skeleton({ className = "" }) {
  return <span className={cn("block animate-pulse rounded bg-surface-muted", className)} />;
}
