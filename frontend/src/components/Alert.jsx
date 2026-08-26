import { CircleCheck, CircleAlert, X } from "lucide-react";

const looks = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-slate-200 bg-slate-50 text-slate-600",
};

const icons = {
  error: <CircleAlert size={16} className="mt-0.5 shrink-0" />,
  success: <CircleCheck size={16} className="mt-0.5 shrink-0" />,
  info: null,
};

// A short-lived message. Pass onDismiss when the caller owns the message and
// can clear it — that is what puts the close button there.
export default function Alert({
  variant = "error",
  className = "",
  onDismiss,
  children,
}) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={
        "mb-4 flex items-start gap-2 rounded-md border py-2 pl-3 text-sm " +
        (onDismiss ? "pr-2 " : "pr-3 ") +
        looks[variant] +
        " " +
        className
      }
    >
      {icons[variant]}

      <span className="min-w-0 whitespace-pre-line">{children}</span>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="-my-0.5 -mr-0.5 ml-1 shrink-0 rounded p-1 opacity-60 hover:bg-black/5 hover:opacity-100"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
