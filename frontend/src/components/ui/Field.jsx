import { useId, useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/cn.js";

export const CONTROL_STYLE =
  "w-full rounded-lg border border-line bg-surface text-sm text-content " +
  "placeholder:text-content-subtle transition-[border-color,box-shadow] duration-150 " +
  "hover:border-line-strong focus:border-primary focus:outline-none " +
  "focus:ring-4 focus:ring-primary/20 " +
  "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-content-subtle";

const LEADING_ICON_STYLE =
  "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle";

/** Label + optional hint/error wrapper. Wires the ids so the label, hint and
 *  error are all announced with the control. */
export function Field({ label, hint, error, required, className = "", children }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-content">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>

      {children({
        id,
        required,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined,
      })}

      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-content-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ Icon, className = "", ...rest }) {
  return (
    <span className="relative block">
      {Icon && <Icon aria-hidden="true" className={LEADING_ICON_STYLE} />}
      <input className={cn(CONTROL_STYLE, "h-10 px-3", Icon && "pl-10", className)} {...rest} />
    </span>
  );
}

export function PasswordInput({ Icon, className = "", ...rest }) {
  const [isVisible, setIsVisible] = useState(false);
  const RevealIcon = isVisible ? EyeOff : Eye;

  return (
    <span className="relative block">
      {Icon && <Icon aria-hidden="true" className={LEADING_ICON_STYLE} />}
      <input
        type={isVisible ? "text" : "password"}
        className={cn(CONTROL_STYLE, "h-10 pl-3 pr-11", Icon && "pl-10", className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setIsVisible(wasVisible => !wasVisible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-content-subtle transition hover:bg-surface-muted hover:text-content"
      >
        <RevealIcon aria-hidden="true" className="h-4 w-4" />
      </button>
    </span>
  );
}

export function SelectInput({ Icon, className = "", children, ...rest }) {
  return (
    <span className="relative block">
      {Icon && <Icon aria-hidden="true" className={LEADING_ICON_STYLE} />}
      <select
        className={cn(
          CONTROL_STYLE,
          "h-10 appearance-none pl-3 pr-10",
          Icon && "pl-10",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle"
      />
    </span>
  );
}

export function TextArea({ className = "", ...rest }) {
  return <textarea className={cn(CONTROL_STYLE, "min-h-24 px-3 py-2.5", className)} {...rest} />;
}

/** Checkbox owns its own label, so it does not go through <Field>. */
export function CheckboxField({ label, hint, className = "", ...rest }) {
  const id = useId();

  return (
    <div className={cn("min-w-0", className)}>
      <span className="mb-1.5 block text-sm font-medium text-content">{label}</span>
      <label
        htmlFor={id}
        className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-sm text-content-muted transition hover:border-line-strong"
      >
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 shrink-0 rounded border-line-strong accent-[var(--color-primary)]"
          {...rest}
        />
        {hint || label}
      </label>
    </div>
  );
}
