import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../lib/cn.js";

const TONES = {
  error: { style: "bg-danger-soft text-danger", Icon: AlertCircle, role: "alert" },
  success: { style: "bg-success-soft text-success", Icon: CheckCircle2, role: "status" },
  info: { style: "bg-info-soft text-info", Icon: Info, role: "status" },
};

function Message({ tone, children, className = "", onDismiss }) {
  if (!children) {
    return null;
  }

  const { style, Icon, role } = TONES[tone];

  return (
    <div
      role={role}
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ring-1 ring-inset ring-current/15",
        style,
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1">{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-0.5 rounded p-1 opacity-70 transition hover:opacity-100"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function ErrorMessage(props) {
  return <Message tone="error" {...props} />;
}

export function SuccessMessage(props) {
  return <Message tone="success" {...props} />;
}

export function InfoMessage(props) {
  return <Message tone="info" {...props} />;
}
