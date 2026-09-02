import { cn } from "../../lib/cn.js";

export function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-surface shadow-card", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ Icon, title, description, action, className = "" }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
            <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-content">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-content-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return (
    <div className={cn("flex items-center gap-3 border-t border-line px-5 py-4", className)}>
      {children}
    </div>
  );
}
