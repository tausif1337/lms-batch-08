export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-content">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-content-muted">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
