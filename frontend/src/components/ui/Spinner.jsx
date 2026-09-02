import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/cn.js";

export default function Spinner({ className = "" }) {
  return <LoaderCircle aria-hidden="true" className={cn("h-4 w-4 animate-spin", className)} />;
}
