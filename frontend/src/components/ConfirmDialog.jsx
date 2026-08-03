import { useEffect } from "react";
import { TriangleAlert, X } from "lucide-react";
import Button from "./Button.jsx";
import IconButton from "./IconButton.jsx";

// Replaces window.confirm(), which cannot be styled and blocks the whole tab
// while it is open. `open` decides whether it shows; the page owns that state.
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  isWorking = false,
  onConfirm,
  onCancel,
}) {
  // Escape closes it, the way the native dialog did.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-lg"
        // Clicking the card itself must not reach the backdrop's onClick.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
              <TriangleAlert size={16} />
            </span>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          </div>

          <IconButton onClick={onCancel} aria-label="Close">
            <X size={16} />
          </IconButton>
        </div>

        <p className="mb-5 text-sm text-slate-600">{message}</p>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isWorking}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isWorking}
            className="disabled:opacity-60"
          >
            {isWorking ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
