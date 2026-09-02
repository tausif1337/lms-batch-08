import { Inbox } from "lucide-react";

export default function EmptyState({ Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-content-subtle">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <p className="font-semibold text-content">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-content-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
