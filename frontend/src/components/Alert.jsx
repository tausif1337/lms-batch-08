import { CircleCheck, CircleAlert } from "lucide-react";

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

export default function Alert({ variant = "error", className = "", children }) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={
        "mb-4 flex items-start gap-2 whitespace-pre-line rounded-md border px-3 py-2 text-sm " +
        looks[variant] +
        " " +
        className
      }
    >
      {icons[variant]}
      <span>{children}</span>
    </div>
  );
}
