import { AlertCircle, CheckCircle2 } from "lucide-react";

const SHARED_STYLE = "flex items-start gap-2 rounded-lg px-4 py-3 text-sm";
const ICON_STYLE = "mt-0.5 h-4 w-4 shrink-0";

export function ErrorMessage({ children, className = "" }) {
  if (!children) {
    return null;
  }

  return (
    <p className={`${SHARED_STYLE} bg-red-50 text-red-700 ${className}`}>
      <AlertCircle className={ICON_STYLE} />
      {children}
    </p>
  );
}

export function SuccessMessage({ children, className = "" }) {
  if (!children) {
    return null;
  }

  return (
    <p className={`${SHARED_STYLE} bg-emerald-50 text-emerald-700 ${className}`}>
      <CheckCircle2 className={ICON_STYLE} />
      {children}
    </p>
  );
}
