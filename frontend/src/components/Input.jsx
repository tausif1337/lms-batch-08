import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({ label, className = "", type = "text", ...rest }) {
  // A password box gets an eye button that turns it back into a plain text
  // box. Every password field in the app is an Input, so the pages have
  // nothing to do.
  const isPassword = type === "password";
  const [isShowing, setIsShowing] = useState(false);

  // The eye button has to sit outside the <label>, otherwise its own text
  // becomes part of the box's name and a screen reader reads out
  // "Password Show password". So the password version ties the two together
  // with an id instead of by nesting.
  const id = useId();

  if (!isPassword) {
    return (
      <label className={className}>
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>

        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          type={type}
          {...rest}
        />
      </label>
    );
  }

  const action = isShowing ? "Hide password" : "Show password";

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      {/* This wrapper is what the button is positioned against, and the extra
          right padding keeps the typed text from running underneath it. */}
      <div className="relative">
        <input
          id={id}
          className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-indigo-500"
          type={isShowing ? "text" : "password"}
          {...rest}
        />

        <button
          type="button"
          onClick={() => setIsShowing(!isShowing)}
          // The name says what the button will do next, not what the box is
          // doing now. That is the wording a screen reader reads out.
          aria-label={action}
          aria-pressed={isShowing}
          title={action}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 text-slate-500 hover:text-slate-700"
        >
          {isShowing ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
