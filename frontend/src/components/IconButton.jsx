// A small square button with only a little picture inside it, no words.
// The pencil, the bin and the X that closes a form are all this button.
//
// `variant` picks the colour:
//   "plain"  -> grey, for the pencil and the X
//   "danger" -> red, for the bin

const looks = {
  plain: "rounded-md p-2 text-slate-600 hover:bg-slate-100",
  danger: "rounded-md p-2 text-red-600 hover:bg-red-50",
};

export default function IconButton({
  variant = "plain",
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
