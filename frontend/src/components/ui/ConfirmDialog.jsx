import { useEffect, useId, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button.jsx";

/**
 * Replacement for window.confirm: themable, keyboard accessible, and it does not
 * block the main thread. Rendered only while `isOpen`.
 */
export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isWorking = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const cancelRef = useRef(null);
  const elementFocusedBeforeOpen = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    elementFocusedBeforeOpen.current = document.activeElement;
    // Focus the safe action: Enter on an unread dialog must not destroy a record.
    cancelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      // Keep Tab inside the dialog while it is open.
      const focusable = panelRef.current?.querySelectorAll(
        "button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );

      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      elementFocusedBeforeOpen.current?.focus?.();
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl border border-line bg-surface-raised p-6 shadow-pop"
      >
        <div className="flex gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold text-content">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-content-muted">{description}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={isWorking}>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isWorking}
            loadingLabel="Working..."
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
