const looks = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function Alert({ variant = "error", className = "", children }) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={
        "mb-4 whitespace-pre-line rounded-md border px-3 py-2 text-sm " +
        looks[variant] +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}
