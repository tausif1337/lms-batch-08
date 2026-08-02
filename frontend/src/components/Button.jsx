// A button with words on it.
//
// `variant` picks the look:
//   "primary"   -> the blue one, used for Save and for the Add buttons
//   "secondary" -> the white one with a grey border, used for Cancel
//
// The `...rest` at the end means "anything else written on this component".
// So <Button onClick={save} disabled>Save</Button> hands onClick and disabled
// straight down to the real <button> underneath. We do not have to list every
// possible prop ourselves.
//
// `type` starts as "button" because a button inside a <form> submits the form
// unless you say otherwise. Write type="submit" on the one button that should.

const looks = {
  primary:
    "inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700",
  secondary:
    "inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
};

export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  children,
  ...rest
}) {
  return (
    <button type={type} className={looks[variant] + " " + className} {...rest}>
      {children}
    </button>
  );
}
